import type { IconName } from "../primitives/icon";

/**
 * A film is a scripted scenario that plays on a timeline in film milliseconds.
 * Every helper here is a pure function of the script and the film time `t`, so a paused frame,
 * a seek and a recording all show the same picture.
 */

export type FilmTravelKind = "message" | "document" | "event";

export type FilmLane = {
  id: string;
  /** The party, for example "Maya Fischer" or "Brightsmile Dental". */
  label: string;
  /** What the party is in the story, for example "Customer" or "AI assistant". */
  role: string;
  /** A short name for the narrow layout's tabs. Defaults to `role`. */
  tabLabel?: string;
  icon?: IconName;
  /** The business acts in this lane, so its accents use the brand colour. */
  brand?: boolean;
};

export type FilmClockKeyframe = {
  /** Film time in ms. */
  at: number;
  /** Story wall-clock time without a zone offset, for example "2026-03-03T21:47". */
  time: string;
  /** How story time moves from the previous keyframe to this one. "ease" races in the middle. */
  curve?: "linear" | "ease";
};

export type FilmTravel = {
  /** The lane the item leaves. It lands in the beat's own lane. */
  from: string;
  label: string;
  kind: FilmTravelKind;
  /** Flight time in film ms. */
  durationMs?: number;
};

export type FilmBeat<TData> = {
  id: string;
  /** Film time in ms when the beat starts. A travelling beat lands `travel.durationMs` later. */
  at: number;
  /** The lane the beat appears in. */
  lane: string;
  caption?: string;
  travel?: FilmTravel;
  data: TData;
};

export type FilmEnd = {
  /** Film time in ms when the end card appears. */
  at: number;
  metric: string;
  before: string;
  after: string;
  lines?: string[];
  /** For example "Simulated with a fictional company". */
  note?: string;
};

export type FilmScript<TData> = {
  id: string;
  title: string;
  durationMs: number;
  lanes: FilmLane[];
  clock: FilmClockKeyframe[];
  beats: FilmBeat<TData>[];
  end: FilmEnd;
};

export type ActiveTravel<TData> = {
  beat: FilmBeat<TData> & { travel: FilmTravel };
  from: string;
  to: string;
  /** 0 when the item leaves, 1 when it lands. Linear; the travel layer applies the curve. */
  progress: number;
};

export const DEFAULT_TRAVEL_MS = 800;

/** Checks a script once, where it is written, so a typo in a lane id fails loudly. */
export function defineFilmScript<TData>(script: FilmScript<TData>): FilmScript<TData> {
  const laneIds = new Set(script.lanes.map((lane) => lane.id));
  const fail = (message: string) => {
    throw new Error(`Film script "${script.id}": ${message}`);
  };
  if (laneIds.size !== script.lanes.length) fail("lane ids must be unique");
  if (script.clock.length === 0) fail("the clock needs at least one keyframe");
  script.clock.forEach((frame, index) => {
    if (Number.isNaN(parseStoryTime(frame.time))) fail(`clock time "${frame.time}" is not an ISO time`);
    const previous = script.clock[index - 1];
    if (previous && frame.at < previous.at) fail("clock keyframes must be in film order");
  });
  const beatIds = new Set<string>();
  for (const beat of script.beats) {
    if (beatIds.has(beat.id)) fail(`beat id "${beat.id}" is used twice`);
    beatIds.add(beat.id);
    if (!laneIds.has(beat.lane)) fail(`beat "${beat.id}" names unknown lane "${beat.lane}"`);
    if (beat.travel && !laneIds.has(beat.travel.from)) {
      fail(`beat "${beat.id}" travels from unknown lane "${beat.travel.from}"`);
    }
    if (beatArrival(beat) > script.durationMs) fail(`beat "${beat.id}" lands after the film ends`);
  }
  if (script.end.at > script.durationMs) fail("the end card starts after the film ends");
  return { ...script, beats: [...script.beats].sort((a, b) => a.at - b.at) };
}

/** Film time at which the beat is visible in its lane. */
export function beatArrival(beat: FilmBeat<unknown>): number {
  return beat.travel ? beat.at + (beat.travel.durationMs ?? DEFAULT_TRAVEL_MS) : beat.at;
}

/** Beats visible at `t`, in the order they arrived. */
export function beatsUntil<TData>(script: FilmScript<TData>, t: number): FilmBeat<TData>[] {
  return script.beats
    .filter((beat) => beatArrival(beat) <= t)
    .sort((a, b) => beatArrival(a) - beatArrival(b));
}

/** Items in flight at `t`. */
export function activeTravels<TData>(script: FilmScript<TData>, t: number): ActiveTravel<TData>[] {
  const travels: ActiveTravel<TData>[] = [];
  for (const beat of script.beats) {
    if (!beat.travel || t < beat.at) continue;
    const arrival = beatArrival(beat);
    if (t >= arrival) continue;
    const progress = (t - beat.at) / (arrival - beat.at);
    travels.push({ beat: { ...beat, travel: beat.travel }, from: beat.travel.from, to: beat.lane, progress });
  }
  return travels;
}

/** The caption of the latest captioned beat. None before the first caption or once the end card shows. */
export function activeCaption(
  script: FilmScript<unknown>,
  t: number,
): { beatId: string; text: string } | null {
  if (t >= script.end.at) return null;
  let caption: { beatId: string; text: string } | null = null;
  for (const beat of script.beats) {
    if (beat.at > t) break;
    if (beat.caption) caption = { beatId: beat.id, text: beat.caption };
  }
  return caption;
}

/** The lane the viewer should look at: where an item is flying to, else where the latest item landed. */
export function focusLane(script: FilmScript<unknown>, t: number): string | undefined {
  const flying = activeTravels(script, t).at(-1);
  if (flying) return flying.to;
  return beatsUntil(script, t).at(-1)?.lane ?? script.lanes[0]?.id;
}

/** Lanes that are about to receive, or just received, a travelling item. */
export function receivingLanes(script: FilmScript<unknown>, t: number, leadMs = 250, holdMs = 700): Set<string> {
  const lanes = new Set<string>();
  for (const beat of script.beats) {
    if (!beat.travel) continue;
    const arrival = beatArrival(beat);
    if (t >= arrival - leadMs && t < arrival + holdMs) lanes.add(beat.lane);
  }
  return lanes;
}

/** Story wall-clock time at `t`, as UTC epoch ms so it formats the same on server and client. */
export function storyTimeAt(script: { clock: FilmClockKeyframe[] }, t: number): number {
  const frames = script.clock;
  const first = frames[0];
  if (!first) return 0;
  if (t <= first.at) return parseStoryTime(first.time);
  for (let index = 1; index < frames.length; index++) {
    const from = frames[index - 1];
    const to = frames[index];
    if (!from || !to || t > to.at) continue;
    const span = to.at - from.at;
    const linear = span === 0 ? 1 : (t - from.at) / span;
    const eased = to.curve === "ease" ? easeInOutCubic(linear) : linear;
    const start = parseStoryTime(from.time);
    return start + (parseStoryTime(to.time) - start) * eased;
  }
  return parseStoryTime(frames.at(-1)?.time ?? first.time);
}

/** Story ms per film ms at `t`. Above 1 means time is compressed. */
export function storyRateAt(script: { clock: FilmClockKeyframe[] }, t: number, windowMs = 100): number {
  const before = storyTimeAt(script, Math.max(0, t - windowMs / 2));
  const after = storyTimeAt(script, t + windowMs / 2);
  return (after - before) / windowMs;
}

/** Parses a wall-clock ISO time as if it were UTC, so the story clock ignores the viewer's zone. */
export function parseStoryTime(time: string): number {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(time);
  return Date.parse(hasZone ? time : `${time}Z`);
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}
