import { formatSlotChip } from "./calendar";
import type { Channel } from "./channel";
import type { ConversationStatus } from "./conversation-status";

/** The views both modes draw from: threads, calendar blocks and owner rows. */

export type SlotView = { iso: string; picked?: boolean };

export type ThreadMessage = {
  id: string;
  role: "customer" | "assistant";
  text: string;
  /** Wall-clock time, for example "2026-11-10T21:42:00". */
  at: string;
  slots?: SlotView[];
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

export type CalendarBlock = {
  id: string;
  kind: "busy" | "offered" | "booked";
  start: string;
  end: string;
  title: string;
};

export type OwnerRow = {
  id: string;
  channel: Channel;
  name: string;
  summary: string;
  status: ConversationStatus;
  /** Wall-clock time of the last message, for the sort and the time column. */
  lastActivity: string;
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
