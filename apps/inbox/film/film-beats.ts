import type { FilmTravelKind } from "@diepen/ui/film/film-script";
import type { FilmEffect } from "./film-effects";
import { filmMessages, type ConversationRef } from "./fixtures";

/**
 * The beat table of section 2 in docs/features/inbox.md. Text holds slots; `buildInboxFilm` fills
 * them for the active profile. A customer message lands in the thread first and travels to the AI
 * a moment later, so the viewer sees where it came from.
 */

export type LaneId = "customers" | "ai" | "calendar" | "owner";

export type BeatRow = {
  at: number;
  lane: LaneId;
  /** Story clock, "21:42:00". Times before noon are on 11 November. */
  time: string;
  /** The clock races to this beat on an ease instead of a straight line. */
  ease?: boolean;
  travel?: { from: LaneId; kind: FilmTravelKind; label: string };
  caption?: string;
  effects: FilmEffect[];
};

const byId = new Map(filmMessages.map((item) => [item.id, item]));
function says(id: string, pick?: string): FilmEffect {
  const found = byId.get(id);
  if (!found) throw new Error(`No film message "${id}"`);
  return { type: "message", message: found, pick };
}

const fromCustomer = (label: string) => ({ from: "customers", kind: "message", label }) as const;
const fromAi = (kind: FilmTravelKind, label: string) => ({ from: "ai", kind, label }) as const;
const thinking = (conversation: ConversationRef, more: Omit<Extract<FilmEffect, { type: "card" }>, "type" | "conversation"> = {}): FilmEffect =>
  ({ type: "card", conversation, typing: true, ...more });
const owner = (conversation: ConversationRef, status: Extract<FilmEffect, { type: "owner" }>["status"], summary: string, phone?: string): FilmEffect =>
  ({ type: "owner", conversation, status, summary, phone });

export const beatRows: BeatRow[] = [
  { at: 0, lane: "customers", time: "21:40:00", caption: "Closed for the night. Messages keep coming.", effects: [{ type: "channel", channel: "email" }] },
  { at: 3000, lane: "customers", time: "21:42:00", caption: "An email from Ana. She wants a morning slot.", effects: [says("C1-1")] },
  { at: 4500, lane: "ai", time: "21:42:10", travel: fromCustomer("Email from Ana"), effects: [thinking("C1", { intent: "Price and a first visit" })] },
  { at: 7000, lane: "customers", time: "21:42:42", travel: fromAi("message", "Reply to Ana"), caption: "{assistant} replies in 42 seconds.", effects: [says("C1-2")] },
  { at: 7600, lane: "owner", time: "21:42:45", travel: fromAi("event", "Ana: answered"), effects: [owner("C1", "answered", "Price and a first visit")] },
  { at: 11000, lane: "customers", time: "21:44:10", effects: [says("C1-3")] },
  { at: 11400, lane: "ai", time: "21:44:20", travel: fromCustomer("Ana: Wed or Thu"), effects: [thinking("C1", { tags: ["Routine visit", "Wed or Thu morning"] })] },
  { at: 13500, lane: "calendar", time: "21:44:28", travel: fromAi("event", "Free mornings?"), caption: "It checks the calendar for free mornings.", effects: [{ type: "offer", conversation: "C1", slots: ["2026-11-12T09:00", "2026-11-12T10:30"], title: "Offered" }] },
  { at: 14500, lane: "customers", time: "21:44:31", travel: fromAi("message", "Two times for Ana"), effects: [says("C1-4"), owner("C1", "booking_offered", "Price and a first visit")] },
  { at: 17500, lane: "customers", time: "21:45:05", effects: [says("C1-5", "2026-11-12T09:00")] },
  { at: 17900, lane: "ai", time: "21:45:09", travel: fromCustomer("Ana: 09:00"), effects: [thinking("C1")] },
  { at: 19000, lane: "calendar", time: "21:45:14", travel: fromAi("event", "Book Thu 09:00"), caption: "Booked. Thursday 09:00 is in the calendar.", effects: [{ type: "book", conversation: "C1", slot: "2026-11-12T09:00", title: "Ana Ruiz, {ServiceA}" }] },
  { at: 20000, lane: "customers", time: "21:45:16", travel: fromAi("message", "Confirmation to Ana"), effects: [says("C1-6")] },
  { at: 21000, lane: "owner", time: "21:45:18", travel: fromAi("event", "Ana: booked"), effects: [owner("C1", "booked", "Booked, Thu 12 Nov 09:00")] },
  { at: 24000, lane: "customers", time: "23:13:00", caption: "Instagram after 23:00. Priya asks for a price.", effects: [{ type: "channel", channel: "instagram" }, says("C2-1")] },
  { at: 25200, lane: "ai", time: "23:13:08", travel: fromCustomer("DM from Priya"), effects: [thinking("C2", { intent: "Asks about {serviceB}" })] },
  { at: 27000, lane: "customers", time: "23:13:24", travel: fromAi("message", "Reply to Priya"), caption: "The price and one question, 24 seconds later.", effects: [says("C2-2")] },
  { at: 27600, lane: "owner", time: "23:13:26", travel: fromAi("event", "Priya: answered"), effects: [owner("C2", "answered", "Asks about {serviceB}")] },
  { at: 30000, lane: "customers", time: "23:15:40", effects: [says("C2-3")] },
  { at: 30400, lane: "ai", time: "23:15:44", travel: fromCustomer("Priya: in March"), effects: [thinking("C2")] },
  { at: 32500, lane: "customers", time: "23:15:52", travel: fromAi("message", "Reply to Priya"), caption: "Priya has no date yet. The thread stays open.", effects: [says("C2-4")] },
  { at: 33200, lane: "owner", time: "23:15:54", travel: fromAi("event", "Priya: answered"), effects: [owner("C2", "answered", "Wants {serviceB} before March")] },
  { at: 36000, lane: "customers", time: "00:31:00", caption: "After midnight on LinkedIn. A team of 14 asks.", effects: [{ type: "channel", channel: "linkedin" }, says("C3-1")] },
  { at: 37200, lane: "ai", time: "00:31:10", travel: fromCustomer("Message from Tom"), effects: [thinking("C3", { intent: "Company offer for 14 people" })] },
  { at: 39500, lane: "customers", time: "00:31:36", travel: fromAi("message", "Reply to Tom"), caption: "Two questions so {owner} gets a useful call.", effects: [says("C3-2")] },
  { at: 40100, lane: "owner", time: "00:31:38", travel: fromAi("event", "Tom: answered"), effects: [owner("C3", "answered", "Company offer for 14 people")] },
  { at: 43000, lane: "customers", time: "00:33:02", effects: [says("C3-3")] },
  { at: 43400, lane: "ai", time: "00:33:06", travel: fromCustomer("Tom: 10 to 12"), effects: [thinking("C3", { tags: ["10 to 12 people", "Spread over the year"] })] },
  { at: 44200, lane: "calendar", time: "00:33:15", travel: fromAi("event", "Call times?"), effects: [{ type: "offer", conversation: "C3", slots: ["2026-11-11T16:00", "2026-11-13T10:30"], title: "Call" }] },
  { at: 45200, lane: "customers", time: "00:33:20", travel: fromAi("message", "Two times for Tom"), effects: [says("C3-4"), owner("C3", "booking_offered", "Company offer for 14 people")] },
  { at: 47800, lane: "customers", time: "00:34:10", effects: [says("C3-5", "2026-11-13T10:30")] },
  { at: 48100, lane: "ai", time: "00:34:12", travel: fromCustomer("Tom: Friday"), effects: [thinking("C3")] },
  { at: 49000, lane: "calendar", time: "00:34:16", travel: fromAi("event", "Book Fri 10:30"), caption: "A call with {owner}, booked for Friday.", effects: [{ type: "book", conversation: "C3", slot: "2026-11-13T10:30", title: "Call: Tom Becker, Fernhill Architects" }] },
  { at: 49800, lane: "customers", time: "00:34:19", travel: fromAi("message", "Confirmation to Tom"), effects: [says("C3-6")] },
  { at: 50600, lane: "owner", time: "00:34:21", travel: fromAi("document", "Notes for the call"), effects: [owner("C3", "booked", "Call booked, Fri 13 Nov 10:30. 10 to 12 people, spread over the year")] },
  { at: 53000, lane: "customers", time: "06:34:00", caption: "Website chat. Daniel wants a refund.", effects: [{ type: "channel", channel: "chat" }, says("C4-1")] },
  { at: 54200, lane: "ai", time: "06:34:08", travel: fromCustomer("Chat from Daniel"), caption: "The policy says refunds go to {owner}.", effects: [thinking("C4", { intent: "Refund request", status: "needs_human", policy: "Policy: refunds go to {owner}" })] },
  { at: 56000, lane: "customers", time: "06:34:18", travel: fromAi("message", "Reply to Daniel"), effects: [says("C4-2")] },
  { at: 56800, lane: "owner", time: "06:34:20", travel: fromAi("message", "Handover to {owner}"), caption: "{owner} gets the thread, marked Needs a human.", effects: [owner("C4", "needs_human", "Refund request after a visit on Monday")] },
  { at: 59500, lane: "customers", time: "06:35:02", effects: [says("C4-3")] },
  { at: 59800, lane: "ai", time: "06:35:05", travel: fromCustomer("Daniel's number"), effects: [thinking("C4")] },
  { at: 61000, lane: "customers", time: "06:35:10", travel: fromAi("message", "Reply to Daniel"), effects: [says("C4-4"), { type: "handover", conversation: "C4", note: "Handed to {owner}" }] },
  { at: 61800, lane: "owner", time: "06:35:12", travel: fromAi("event", "Number for {owner}"), effects: [owner("C4", "needs_human", "Refund request after a visit on Monday. Call back on 07700 900123", "07700 900123")] },
  { at: 64000, lane: "owner", time: "08:00:00", ease: true, caption: "08:00. Every conversation, in one list.", effects: [{ type: "open" }] },
  { at: 68000, lane: "owner", time: "08:00:30", caption: "The refund is on top, with the whole thread.", effects: [{ type: "select", conversation: "C4" }] },
  { at: 72000, lane: "calendar", time: "08:01:00", caption: "Two bookings made overnight, ready at 08:00.", effects: [{ type: "highlight" }] },
];
