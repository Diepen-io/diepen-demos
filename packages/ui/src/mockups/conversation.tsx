/** A time the assistant offered, shown as a chip under its message. */
export type SlotChip = {
  /** Local ISO time without zone, for example "2026-11-12T09:00". */
  iso: string;
  /** As the chip reads, for example "Thu 12 Nov, 09:00". */
  label: string;
  /** Marks the slot the customer chose. */
  picked?: boolean;
};

/** One message in a direct-message or chat mockup, seen from the business's side. */
export type ConversationMessage = {
  id: string;
  from: "customer" | "business";
  text: string;
  /** Shown as a divider before the message, for example "Today 21:14". */
  time?: string;
  /** A quiet line under the message, for example "Replied in 1.8 s". */
  meta?: string;
  slots?: SlotChip[];
  /** Plays the entrance when the message arrives during a film beat or a live reply. */
  isNew?: boolean;
};

export type Person = {
  name: string;
  /** A handle, headline or email, shown under the name. */
  detail?: string;
  avatarUrl?: string;
};

/** What a conversation mockup does when a visitor drives it in live mode. All optional: the film passes none. */
export type ConversationControls = {
  /**
   * Sends the composer text. Return or resolve `false` to put the text back, for example when
   * the request failed and the visitor should send it again.
   */
  onSend?: (text: string, subject?: string) => boolean | void | Promise<boolean | void>;
  /** Suggested first messages, shown while the thread is empty. A click sends one. */
  starters?: string[];
  onPickSlot?: (iso: string) => void;
  /** Disables the composer while a reply is on its way. */
  sending?: boolean;
  /** Replaces the composer once a person has taken over the conversation. */
  handover?: { note: string; onStartOver?: () => void };
  /** A line at the end of the thread, for example an error to retry. */
  notice?: string;
};
