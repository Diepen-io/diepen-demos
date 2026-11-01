import type { InboxReply } from "@diepen/voice/tasks/inbox-reply";
import { channels, type Channel } from "@/domain/channel";
import { applyReply, type ConversationStatus } from "@/domain/conversation-status";

/** The visitor's four threads and the bookings they made. Page memory only: a reload starts empty. */

export type LiveMessage = {
  id: string;
  role: "customer" | "assistant";
  text: string;
  /** The visitor's local time, "2026-11-10T21:42". */
  at: string;
  offeredSlots?: string[];
  pickedSlot?: string;
  replyMs?: number;
  /** The request for a reply failed. The message stays in view until the visitor sends again. */
  failed?: boolean;
};

export type LiveThread = {
  messages: LiveMessage[];
  status?: ConversationStatus;
  lastReply?: InboxReply;
  /** The slots the assistant offered in its last turn. */
  offeredSlots: string[];
  sending: boolean;
  notice?: string;
  unread: boolean;
  subject?: string;
};

export type LiveBooking = { slot: string; channel: Channel; isCall: boolean };

export type LiveState = { active: Channel; threads: Record<Channel, LiveThread>; bookings: LiveBooking[]; nextId: number };

export type LiveAction =
  | { type: "select"; channel: Channel }
  | { type: "send"; channel: Channel; text: string; at: string; subject?: string }
  | { type: "reply"; channel: Channel; reply: InboxReply; replyMs: number; at: string }
  | { type: "fail"; channel: Channel }
  | { type: "startOver"; channel: Channel };

const emptyThread = (): LiveThread => ({ messages: [], offeredSlots: [], sending: false, unread: false });

export function initialLiveState(): LiveState {
  return {
    active: "chat",
    threads: Object.fromEntries(channels.map((channel) => [channel, emptyThread()])) as Record<Channel, LiveThread>,
    bookings: [],
    nextId: 1,
  };
}

function update(state: LiveState, channel: Channel, change: (thread: LiveThread) => LiveThread): LiveState {
  return { ...state, threads: { ...state.threads, [channel]: change(state.threads[channel]) } };
}

export function liveInboxReducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "select":
      return update({ ...state, active: action.channel }, action.channel, (thread) => ({ ...thread, unread: false }));
    case "send": {
      const message: LiveMessage = { id: `m${state.nextId}`, role: "customer", text: action.text, at: action.at };
      return update({ ...state, nextId: state.nextId + 1 }, action.channel, (thread) => ({
        ...thread,
        subject: thread.subject ?? action.subject,
        // A new send replaces a message that got no answer, so a retry never shows it twice.
        messages: [...thread.messages.filter((item) => !item.failed), message],
        sending: true,
        notice: undefined,
      }));
    }
    case "fail":
      return update(state, action.channel, (thread) => ({
        ...thread,
        messages: thread.messages.map((item, index) => (index === thread.messages.length - 1 ? { ...item, failed: true } : item)),
        sending: false,
        notice: "No answer this time. Send it again.",
      }));
    case "reply":
      return addReply(state, action);
    case "startOver":
      return {
        ...update(state, action.channel, () => emptyThread()),
        bookings: state.bookings.filter((booking) => booking.channel !== action.channel),
      };
  }
}

function addReply(state: LiveState, { channel, reply, replyMs, at }: Extract<LiveAction, { type: "reply" }>): LiveState {
  const booked = reply.status === "booked" ? reply.bookedSlot : undefined;
  const message: LiveMessage = { id: `m${state.nextId}`, role: "assistant", text: reply.reply, at, offeredSlots: reply.offeredSlots, replyMs };
  const next = update({ ...state, nextId: state.nextId + 1 }, channel, (thread) => ({
    ...thread,
    messages: [
      ...thread.messages.map((item) => (booked && item.offeredSlots?.includes(booked) ? { ...item, pickedSlot: booked } : item)),
      message,
    ],
    status: applyReply(thread.status, reply.status),
    lastReply: reply,
    offeredSlots: reply.offeredSlots ?? [],
    sending: false,
    unread: channel !== state.active,
  }));
  if (!booked) return next;
  const isCall = /call/i.test(reply.intent);
  return { ...next, bookings: [...next.bookings, { slot: booked, channel, isCall }] };
}
