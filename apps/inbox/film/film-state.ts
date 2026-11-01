import type { FocusFilmScript } from "@diepen/ui/film/focus-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { slotEnd } from "@/domain/calendar";
import type { Channel } from "@/domain/channel";
import { applyReply, type ConversationStatus } from "@/domain/conversation-status";
import { sortOwnerRows, type CalendarBlock, type ThreadMessage } from "@/domain/inbox-snapshot";
import { wallMs } from "@/domain/wall-clock";
import { filmCustomers, filmMessages, type ConversationRef, type FilmMessage } from "./fixtures";
import { buildInboxFilm, type InboxBeat } from "./inbox-film";

const scripts = new WeakMap<CompanyProfile, FocusFilmScript<InboxBeat>>();

/** One script per profile object, so a frame does not rebuild the film. */
export function inboxFilmFor(profile: CompanyProfile): FocusFilmScript<InboxBeat> {
  let script = scripts.get(profile);
  if (!script) {
    script = buildInboxFilm(profile);
    scripts.set(profile, script);
  }
  return script;
}

export type FilmThread = {
  ref: ConversationRef;
  messages: ThreadMessage[];
  status?: ConversationStatus;
  /** Seconds from the customer's first message to the first reply, once there is one. */
  firstReplySeconds?: number;
};

export type FilmOwnerRow = { id: ConversationRef; channel: Channel; name: string; status: ConversationStatus; lastActivity: string };

export type FilmBooking = CalendarBlock & { ref: ConversationRef };

/** Everything the panels show at one story moment. */
export type FilmFrame = {
  threads: Record<ConversationRef, FilmThread>;
  /** The night's offers and bookings. Busy blocks come from the calendar itself. */
  bookings: FilmBooking[];
  /** Needs a human first, then the latest activity first. */
  ownerRows: FilmOwnerRow[];
};

const refs = Object.keys(filmCustomers) as ConversationRef[];

/**
 * The picture at story time `story` ("2026-11-10T22:14:38"): every fixture message sent by then.
 * Panels draw from the beat's story time, not the racing clock, so a beat's picture holds still.
 */
export function frameAt(story: string, bookingMinutes: number): FilmFrame {
  const sentBy = (ref: ConversationRef) =>
    filmMessages.filter((message) => message.conversation === ref && wallMs(message.at) <= wallMs(story));
  const threads = Object.fromEntries(refs.map((ref) => [ref, threadAt(ref, sentBy(ref))])) as Record<ConversationRef, FilmThread>;
  const ownerRows = refs.flatMap((ref) => {
    const { status, messages } = threads[ref];
    const last = messages.at(-1);
    if (!status || !last) return [];
    const customer = filmCustomers[ref];
    return [{ id: ref, channel: customer.channel, name: customer.name, status, lastActivity: last.at }];
  });
  return {
    threads,
    bookings: refs.flatMap((ref) => bookingsOf(ref, sentBy(ref), bookingMinutes)),
    ownerRows: sortOwnerRows(ownerRows),
  };
}

function threadAt(ref: ConversationRef, messages: FilmMessage[]): FilmThread {
  const booked = messages.findLast((message) => message.reply?.bookedSlot)?.reply?.bookedSlot;
  const status = messages.reduce<ConversationStatus | undefined>(
    (current, message) => (message.reply ? applyReply(current, message.reply.status) : current),
    undefined,
  );
  const first = messages.find((message) => message.role === "customer");
  const reply = messages.find((message) => message.role === "assistant");
  return {
    ref,
    status,
    firstReplySeconds: first && reply ? Math.round((wallMs(reply.at) - wallMs(first.at)) / 1000) : undefined,
    messages: messages.map(({ id, role, text, at, reply: structured }) => ({
      id,
      role,
      text,
      at,
      // An offer marks the slot the customer picked once it is booked.
      slots: structured?.offeredSlots?.map((iso) => ({ iso, picked: iso === booked })),
    })),
  };
}

/** The open offer as dashed blocks, or the booking once there is one. */
function bookingsOf(ref: ConversationRef, messages: FilmMessage[], minutes: number): FilmBooking[] {
  const latest = messages.findLast((message) => message.reply?.bookedSlot || message.reply?.offeredSlots);
  const title = filmCustomers[ref].bookingTitle ?? filmCustomers[ref].name;
  const block = (kind: CalendarBlock["kind"], start: string): FilmBooking => ({
    id: `${ref}-${kind}-${start}`,
    ref,
    kind,
    start,
    end: slotEnd(start, minutes),
    title,
  });
  if (latest?.reply?.bookedSlot) return [block("booked", latest.reply.bookedSlot)];
  return latest?.reply?.offeredSlots?.map((start) => block("offered", start)) ?? [];
}
