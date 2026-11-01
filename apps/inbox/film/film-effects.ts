import type { Channel } from "@/domain/channel";
import type { ConversationStatus } from "@/domain/conversation-status";
import type { ConversationRef, FilmMessage } from "./fixtures";

/** What one beat changes in the picture. `snapshotAt` applies them in order. */
export type FilmEffect =
  | { type: "channel"; channel: Channel }
  /** A message lands in its thread. `pick` marks the slot the customer chose in the offer before. */
  | { type: "message"; message: FilmMessage; pick?: string }
  /** The AI lane card: created on first use, then updated. */
  | {
      type: "card";
      conversation: ConversationRef;
      intent?: string;
      tags?: string[];
      typing?: boolean;
      status?: ConversationStatus;
      policy?: string;
    }
  | { type: "offer"; conversation: ConversationRef; slots: string[]; title: string }
  | { type: "book"; conversation: ConversationRef; slot: string; title: string }
  | { type: "owner"; conversation: ConversationRef; summary: string; status: ConversationStatus; phone?: string }
  | { type: "handover"; conversation: ConversationRef; note: string }
  /** 08:00: the business opens and the owner looks at the list. */
  | { type: "open" }
  | { type: "select"; conversation: ConversationRef }
  /** The calendar points back at the night's bookings. */
  | { type: "highlight" };

/** The data of one film beat: its story time and what it changes. */
export type InboxBeat = { story: string; effects: FilmEffect[] };
