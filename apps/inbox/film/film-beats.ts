import type { ConversationRef } from "./fixtures";

/**
 * The beat table of section 2 in docs/features/inbox.md: one focus per beat. Captions hold slots;
 * `buildInboxFilm` fills them for the profile. What each panel shows follows from the beat's story
 * time alone (`film-state.ts`), so a beat names only where to look.
 */

export type PartyId = "ana" | "priya" | "tom" | "daniel" | "calendar" | "owner";

export type BeatRow = {
  at: number;
  /** Story clock, "21:42:00". Times before noon are on 11 November. */
  time: string;
  /** The conversation the beat is about. The calendar shows the day of its booking. */
  conversation?: ConversationRef;
  focus: PartyId;
  partner?: PartyId;
  caption: string;
  highlight: string;
  touches?: PartyId[];
};

/** The party that shows each conversation's thread. */
export const threadParties: Record<ConversationRef, PartyId> = { C1: "ana", C2: "priya", C3: "tom", C4: "daniel" };

export const beatRows: BeatRow[] = [
  { at: 0, time: "21:42:00", conversation: "C1", focus: "ana", caption: "Closed for the night. Ana emails a question.", highlight: "message-C1-1" },
  { at: 7500, time: "21:44:31", conversation: "C1", focus: "ana", partner: "calendar", caption: "Two free mornings, straight from the calendar.", highlight: "slots-C1-4", touches: ["owner"] },
  { at: 15_000, time: "21:45:16", conversation: "C1", focus: "calendar", partner: "ana", caption: "Ana picks 09:00. It's in the calendar.", highlight: "booking-C1", touches: ["owner"] },
  { at: 22_500, time: "22:14:38", conversation: "C2", focus: "priya", caption: "Instagram at 22:14. Answered in 38 seconds.", highlight: "reply-time-C2", touches: ["owner"] },
  { at: 30_000, time: "23:34:19", conversation: "C3", focus: "tom", partner: "calendar", caption: "Tom books a call with {owner}.", highlight: "message-C3-6", touches: ["owner"] },
  { at: 37_500, time: "00:33:36", conversation: "C4", focus: "daniel", partner: "owner", caption: "A refund request goes to {owner}.", highlight: "handover-C4" },
  { at: 45_000, time: "08:00:00", focus: "owner", caption: "08:00. Every conversation, the refund on top.", highlight: "row-C4" },
];
