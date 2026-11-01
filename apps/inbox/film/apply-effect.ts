import { applyReply } from "@/domain/conversation-status";
import type { AiCardView, InboxSnapshot, ThreadMessage, ThreadView } from "@/domain/inbox-snapshot";
import type { FilmEffect } from "./film-effects";
import { filmCustomers, type ConversationRef } from "./fixtures";

/** Where and when an effect happens: the beat's story time and its landing time in film ms. */
export type EffectMoment = { story: string; since: number; minutes: number };

const replace = <T extends { id: string }>(items: T[], id: string, next: (item: T) => T) =>
  items.map((item) => (item.id === id ? next(item) : item));

function newThread(ref: ConversationRef): ThreadView {
  const customer = filmCustomers[ref];
  return { id: ref, channel: customer.channel, customer: { name: customer.name, detail: customer.detail }, subject: customer.subject, messages: [] };
}

function newCard(ref: ConversationRef): AiCardView {
  const customer = filmCustomers[ref];
  return { id: ref, channel: customer.channel, customerName: customer.name, intent: "", tags: [], typing: false };
}

function upsertCard(snapshot: InboxSnapshot, ref: ConversationRef, change: (card: AiCardView) => AiCardView): AiCardView[] {
  const exists = snapshot.aiCards.some((card) => card.id === ref);
  const cards = exists ? snapshot.aiCards : [...snapshot.aiCards, newCard(ref)];
  return replace(cards, ref, change);
}

const merge = (tags: string[], more: string[] = []) => [...new Set([...tags, ...more])];

function addMessage(snapshot: InboxSnapshot, effect: Extract<FilmEffect, { type: "message" }>, moment: EffectMoment): InboxSnapshot {
  const { message, pick } = effect;
  const ref = message.conversation;
  const threads = snapshot.conversations.some((thread) => thread.id === ref)
    ? snapshot.conversations
    : [...snapshot.conversations, newThread(ref)];
  const landed: ThreadMessage = {
    id: message.id,
    role: message.role,
    text: message.text,
    at: message.at,
    slots: message.reply?.offeredSlots?.map((iso) => ({ iso })),
    since: moment.since,
  };
  const conversations = replace(threads, ref, (thread) => ({
    ...thread,
    messages: [
      ...thread.messages.map((item) =>
        pick && item.slots ? { ...item, slots: item.slots.map((slot) => ({ ...slot, picked: slot.iso === pick })) } : item,
      ),
      landed,
    ],
  }));
  const { reply } = message;
  if (!reply) return { ...snapshot, conversations };

  const firstQuestion = threads.find((thread) => thread.id === ref)?.messages.find((item) => item.role === "customer");
  const aiCards = upsertCard(snapshot, ref, (card) => ({
    ...card,
    intent: card.intent || reply.intent,
    tags: merge(card.tags, reply.notes),
    status: applyReply(card.status, reply.status),
    replySeconds: card.replySeconds ?? secondsBetween(firstQuestion?.at, message.at),
    typing: false,
    since: moment.since,
  }));
  return { ...snapshot, conversations, aiCards };
}

function secondsBetween(from: string | undefined, to: string): number | undefined {
  return from ? Math.round((Date.parse(`${to}Z`) - Date.parse(`${from}Z`)) / 1000) : undefined;
}

export function applyEffect(snapshot: InboxSnapshot, effect: FilmEffect, moment: EffectMoment): InboxSnapshot {
  switch (effect.type) {
    case "channel":
      return { ...snapshot, activeChannel: effect.channel };
    case "message":
      return addMessage(snapshot, effect, moment);
    case "card": {
      const { conversation, type: _type, tags, typing, status, ...rest } = effect;
      return {
        ...snapshot,
        aiCards: upsertCard(snapshot, conversation, (card) => ({
          ...card,
          ...rest,
          tags: merge(card.tags, tags),
          typing: typing ?? card.typing,
          status: status ? applyReply(card.status, status) : card.status,
          since: moment.since,
        })),
      };
    }
    case "offer":
      return {
        ...snapshot,
        calendarBlocks: [
          ...snapshot.calendarBlocks,
          ...effect.slots.map((start) => ({ id: `${effect.conversation}-offer-${start}`, kind: "offered" as const, start, end: start, title: effect.title, since: moment.since })),
        ],
      };
    case "book":
      return {
        ...snapshot,
        calendarBlocks: [
          ...snapshot.calendarBlocks.filter((block) => !block.id.startsWith(`${effect.conversation}-offer-`)),
          { id: `${effect.conversation}-booked`, kind: "booked", start: effect.slot, end: effect.slot, title: effect.title, since: moment.since },
        ],
      };
    case "owner": {
      const customer = filmCustomers[effect.conversation];
      const row = {
        id: effect.conversation,
        channel: customer.channel,
        name: customer.name,
        summary: effect.summary,
        status: effect.status,
        lastActivity: moment.story,
        phone: effect.phone,
        since: moment.since,
      };
      const others = snapshot.ownerRows.filter((item) => item.id !== row.id);
      return { ...snapshot, ownerRows: [...others, row] };
    }
    case "handover":
      return { ...snapshot, conversations: replace(snapshot.conversations, effect.conversation, (thread) => ({ ...thread, handoverNote: effect.note })) };
    case "open":
      return { ...snapshot, open: true };
    case "select":
      return { ...snapshot, selectedRow: effect.conversation };
    case "highlight":
      return { ...snapshot, highlightBookings: true };
  }
}
