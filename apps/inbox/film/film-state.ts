import { beatArrival, beatsUntil, type FilmScript } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { busyBlocks, slotEnd } from "@/domain/calendar";
import { sortOwnerRows, type InboxSnapshot } from "@/domain/inbox-snapshot";
import type { InboxBeat } from "./film-effects";
import { calendarDays } from "./fixtures";
import { buildInboxFilm } from "./inbox-film";
import { applyEffect } from "./apply-effect";

const scripts = new WeakMap<CompanyProfile, FilmScript<InboxBeat>>();

/** One script per profile object, so a frame does not rebuild the film. */
export function inboxFilmFor(profile: CompanyProfile): FilmScript<InboxBeat> {
  let script = scripts.get(profile);
  if (!script) {
    script = buildInboxFilm(profile);
    scripts.set(profile, script);
  }
  return script;
}

function emptySnapshot(): InboxSnapshot {
  return {
    activeChannel: "email",
    conversations: [],
    aiCards: [],
    calendarBlocks: calendarDays.flatMap((day) =>
      busyBlocks(day).map((block, index) => ({ id: `busy-${day}-${index}`, kind: "busy" as const, title: "Busy", ...block })),
    ),
    ownerRows: [],
    open: false,
    highlightBookings: false,
  };
}

/**
 * The picture at film time `ms`: every beat that landed by then, applied in order. Playing, seeking
 * and `?t=` all land on the same picture, because the picture is a function of the time.
 */
export function snapshotAt(ms: number, profile: CompanyProfile): InboxSnapshot {
  // The four lanes of one frame ask for the same picture.
  const last = lastFrames.get(profile);
  if (last?.ms === ms) return last.snapshot;
  const snapshot = buildSnapshot(ms, profile);
  lastFrames.set(profile, { ms, snapshot });
  return snapshot;
}

const lastFrames = new WeakMap<CompanyProfile, { ms: number; snapshot: InboxSnapshot }>();

function buildSnapshot(ms: number, profile: CompanyProfile): InboxSnapshot {
  const script = inboxFilmFor(profile);
  const minutes = profile.knowledge.bookingMinutes;
  const snapshot = beatsUntil(script, ms).reduce(
    (current, beat) => applyEffects(current, beat.data, beatArrival(beat), minutes),
    emptySnapshot(),
  );
  const threads = new Map(snapshot.conversations.map((thread) => [thread.id, thread.messages]));
  return {
    ...snapshot,
    ownerRows: sortOwnerRows(snapshot.ownerRows).map((row) => ({ ...row, thread: threads.get(row.id) })),
    calendarBlocks: snapshot.calendarBlocks.map((block) =>
      block.kind === "busy" ? block : { ...block, end: slotEnd(block.start, minutes) },
    ),
  };
}

function applyEffects(snapshot: InboxSnapshot, beat: InboxBeat, since: number, minutes: number): InboxSnapshot {
  return beat.effects.reduce((current, effect) => applyEffect(current, effect, { story: beat.story, since, minutes }), snapshot);
}
