import { acceptsReplies } from "@/domain/conversation-status";
import { channels, type Channel } from "@/domain/channel";
import type { LiveState } from "./live-inbox-state";

/** What the guide button does. `end` offers "Start over" and the film. */
export type InboxGuideAction = "ask-time" | "ask-refund" | "end";

export type InboxGuide = {
  id: string;
  /** The place in the path, from 1. None at the end. */
  number?: number;
  text: string;
  waiting?: boolean;
  /** The guide points at the times on offer in the open thread. */
  spotlightSlots?: boolean;
  action?: InboxGuideAction;
};

export const inboxGuideSteps = 3;

export type InboxGuideNames = { company: string; assistant: string; owner: string };

/**
 * The one next step in live mode, worked out from the live state alone: ask for a time, pick
 * one, then ask for a refund that goes to a person. Any path the visitor takes lands on a step.
 */
export function inboxGuide(state: LiveState, { company, assistant, owner }: InboxGuideNames): InboxGuide {
  const booked = state.bookings.length > 0;
  const handedOver = channels.some((channel) => state.threads[channel].status === "needs_human");
  const open = state.threads[state.active];
  const timesOnOffer = !booked && open.status === "booking_offered" && open.offeredSlots.length > 0;

  if (booked && handedOver) {
    return { id: "end", text: `${assistant} booked your time. The refund went to ${owner}, because a person must answer it.`, action: "end" };
  }
  if (open.sending) {
    return { id: "waiting", number: booked ? 3 : timesOnOffer ? 2 : 1, text: `${assistant} writes an answer`, waiting: true };
  }
  if (timesOnOffer) {
    return { id: "pick-time", number: 2, text: `${assistant} offers some times. Pick one.`, spotlightSlots: true };
  }
  if (!booked) {
    return { id: "ask-time", number: 1, text: `You play a customer. Ask ${company} for an appointment.`, action: "ask-time" };
  }
  return { id: "ask-refund", number: 3, text: "Booked. Now ask for a refund. A person must answer that.", action: "ask-refund" };
}

/** The open channel when it still takes messages, else the first channel that does. */
export function channelForTime(state: LiveState): Channel {
  if (acceptsReplies(state.threads[state.active].status)) return state.active;
  return channels.find((channel) => acceptsReplies(state.threads[channel].status)) ?? state.active;
}

/** A new channel for the refund, so the booking stays in its own thread. Instagram first, to show a second channel. */
export function channelForRefund(state: LiveState): Channel {
  const order: Channel[] = ["instagram", "chat", "linkedin", "email"];
  return order.find((channel) => state.threads[channel].messages.length === 0) ?? channelForTime(state);
}
