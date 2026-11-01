import { formatSlotChip } from "./calendar";
import type { Channel } from "./channel";
import type { ConversationStatus } from "./conversation-status";

/**
 * The picture both modes render. The film folds its beats into one; live mode builds its rows and
 * blocks from the visitor's threads. `since` is when an item last changed in the film's own clock,
 * so a view can play an entrance only for what just arrived.
 */

export type SlotView = { iso: string; picked?: boolean };

export type ThreadMessage = {
  id: string;
  role: "customer" | "assistant";
  text: string;
  /** Wall-clock time, for example "2026-11-10T21:42:00". */
  at: string;
  slots?: SlotView[];
  since?: number;
};

export type ThreadView = {
  id: string;
  channel: Channel;
  customer: { name: string; detail: string };
  /** Email only. */
  subject?: string;
  messages: ThreadMessage[];
  typing?: "customer" | "business";
  /** Shown in place of the composer once a person owns the thread. */
  handoverNote?: string;
};

export type AiCardView = {
  id: string;
  channel: Channel;
  customerName: string;
  intent: string;
  tags: string[];
  status?: ConversationStatus;
  replySeconds?: number;
  /** The policy that sent the conversation to a person. */
  policy?: string;
  typing: boolean;
  since?: number;
};

export type CalendarBlock = {
  id: string;
  kind: "busy" | "offered" | "booked";
  start: string;
  end: string;
  title: string;
  since?: number;
};

export type OwnerRow = {
  id: string;
  channel: Channel;
  name: string;
  summary: string;
  status: ConversationStatus;
  /** Wall-clock time of the last message, for the sort and the time column. */
  lastActivity: string;
  /** The thread, for the detail an owner opens. */
  thread?: ThreadMessage[];
  /** A number to call back, when the customer gave one. */
  phone?: string;
  since?: number;
};

export type InboxSnapshot = {
  activeChannel: Channel;
  conversations: ThreadView[];
  aiCards: AiCardView[];
  calendarBlocks: CalendarBlock[];
  ownerRows: OwnerRow[];
  /** False through the night, true once the business opens at 08:00. */
  open: boolean;
  /** The row the owner opened. */
  selectedRow?: string;
  /** The calendar points back at the night's bookings. */
  highlightBookings: boolean;
};

/** Needs a human first, then the most recent activity first. */
export function sortOwnerRows<Row extends Pick<OwnerRow, "status" | "lastActivity">>(rows: readonly Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const urgent = Number(b.status === "needs_human") - Number(a.status === "needs_human");
    return urgent || b.lastActivity.localeCompare(a.lastActivity);
  });
}

/** The live summary of a conversation: why it was handed over, when it is booked, or what it is about. */
export function ownerSummary(reply: { intent: string; handoverReason?: string; bookedSlot?: string }): string {
  if (reply.handoverReason) return reply.handoverReason;
  if (reply.bookedSlot) return `Booked, ${formatSlotChip(reply.bookedSlot).replace(",", "")}`;
  return reply.intent;
}
