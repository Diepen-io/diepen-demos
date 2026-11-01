import type { CompanyProfile } from "@diepen/voice/profile";
import type { Channel } from "@/domain/channel";

/** One customer turn in live mode: the thread so far and the calendar as the visitor sees it. */
export type Inquiry = {
  channel: Channel;
  profile: CompanyProfile;
  /** Oldest first. The last one is the customer's new message. */
  messages: { role: "customer" | "assistant"; text: string }[];
  /** Slots already booked in this visit, as "2026-11-12T09:00". */
  bookings: string[];
  /** The slots the assistant offered in its last turn. */
  offeredSlots: string[];
  /** The visitor's local time, "2026-11-10T21:42". */
  now: string;
};
