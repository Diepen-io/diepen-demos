/** Where a conversation stands, as the owner reads it. */
export const conversationStatuses = ["answered", "booking_offered", "booked", "needs_human"] as const;

export type ConversationStatus = (typeof conversationStatuses)[number];

export const statusLabels: Record<ConversationStatus, string> = {
  answered: "Answered",
  booking_offered: "Slot offered",
  booked: "Booked",
  needs_human: "Needs a human",
};

const progress: Record<ConversationStatus, number> = { answered: 0, booking_offered: 1, booked: 2, needs_human: 3 };

/**
 * The status after a new reply. A status only moves forward, so a later answer never hides a
 * booking, and once a person owns the conversation it stays with them.
 */
export function applyReply(current: ConversationStatus | undefined, next: ConversationStatus): ConversationStatus {
  if (!current) return next;
  return progress[next] > progress[current] ? next : current;
}

/** The AI answers only while no person has taken the conversation over. */
export function acceptsReplies(status: ConversationStatus | undefined): boolean {
  return status !== "needs_human";
}
