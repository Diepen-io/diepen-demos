import type { IconName } from "../primitives/icon";
import { parseStoryTime, type FilmClockKeyframe, type FilmEnd } from "./film-script";

/**
 * A focus film shows one thing per beat. Each beat names the party in focus, at most one partner
 * beside it, one short caption and the one element the caption is about. Every other party waits
 * as a chip. Every helper here is a pure function of the script and the film time `t`, so a paused
 * frame, a seek and a recording all show the same picture.
 */

export type FilmParty = {
  id: string;
  /** Who or what it is on screen, for example "Ana Ruiz" or "Calendar". */
  label: string;
  /** What it is in the story, for example "Email" or "Owner". Shown under the label in the panel header. */
  role: string;
  icon?: IconName;
  /** A CSS colour for the icon tile, for example "var(--channel-email)". */
  accent?: string;
  /** The business acts here, so the icon tile uses the brand colour. */
  brand?: boolean;
};

export type FocusBeat<TData> = {
  id: string;
  /** Film ms when the beat starts. The first beat starts at 0. */
  at: number;
  /** The party shown large and centred. */
  focus: string;
  /** The party the focus hands over to. It slides in beside the focus from 768 px up; phones show the focus only. */
  partner?: string;
  /** One short line, at most `MAX_CAPTION_WORDS` words, about the highlighted element. */
  caption: string;
  /** The id of the one element the caption is about. Put it in the focus panel, because phones show only that. */
  highlight?: string;
  /** Parties off screen that changed in this beat. Their chips show a dot until they are on screen again. */
  touches?: string[];
  data: TData;
};

export type FocusFilmScript<TData> = {
  id: string;
  title: string;
  durationMs: number;
  /** In chip order. */
  parties: FilmParty[];
  clock: FilmClockKeyframe[];
  beats: FocusBeat<TData>[];
  end: FilmEnd;
};

/** The panel a party takes in the active beat. */
export type PanelRole = "focus" | "partner";

export const MAX_CAPTION_WORDS = 9;
export const MAX_BEATS = 8;

/** Checks a script once, where it is written, so a typo or a crowded beat fails loudly. */
export function defineFocusFilm<TData>(script: FocusFilmScript<TData>): FocusFilmScript<TData> {
  const fail = (message: string) => {
    throw new Error(`Focus film "${script.id}": ${message}`);
  };
  const partyIds = new Set(script.parties.map((party) => party.id));
  if (partyIds.size !== script.parties.length) fail("party ids must be unique");
  if (script.clock.length === 0) fail("the clock needs at least one keyframe");
  script.clock.forEach((frame, index) => {
    if (Number.isNaN(parseStoryTime(frame.time))) fail(`clock time "${frame.time}" is not an ISO time`);
    const previous = script.clock[index - 1];
    if (previous && frame.at < previous.at) fail("clock keyframes must be in film order");
  });
  if (script.beats.length === 0) fail("a film needs at least one beat");
  if (script.beats.length > MAX_BEATS) fail(`${script.beats.length} beats; a film has at most ${MAX_BEATS}`);
  const beats = [...script.beats].sort((a, b) => a.at - b.at);
  if (beats[0]?.at !== 0) fail("the first beat starts at 0");
  const beatIds = new Set<string>();
  for (const beat of beats) {
    const named = `beat "${beat.id}"`;
    if (beatIds.has(beat.id)) fail(`${named} is used twice`);
    beatIds.add(beat.id);
    for (const party of [beat.focus, beat.partner, ...(beat.touches ?? [])]) {
      if (party !== undefined && !partyIds.has(party)) fail(`${named} names unknown party "${party}"`);
    }
    if (beat.partner === beat.focus) fail(`${named} has the same party as focus and partner`);
    const words = beat.caption.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) fail(`${named} needs a caption`);
    if (words > MAX_CAPTION_WORDS) fail(`${named} caption has ${words} words; at most ${MAX_CAPTION_WORDS}`);
    if (/[–—]/.test(beat.caption)) fail(`${named} caption has an em or en dash`);
    if (beat.at >= script.end.at) fail(`${named} starts after the end card`);
  }
  if (script.end.at > script.durationMs) fail("the end card starts after the film ends");
  return { ...script, beats };
}

/** The beat on screen at `t`: the latest that started. The first beat before that. */
export function activeBeat<TData>(script: FocusFilmScript<TData>, t: number): FocusBeat<TData> {
  let active = script.beats[0];
  for (const beat of script.beats) {
    if (beat.at > t) break;
    active = beat;
  }
  if (!active) throw new Error(`Focus film "${script.id}" has no beats`);
  return active;
}

/** The parties with a panel in this beat, focus first. */
export function partiesOnScreen(beat: FocusBeat<unknown>): string[] {
  return beat.partner ? [beat.focus, beat.partner] : [beat.focus];
}

const namesParty = (beat: FocusBeat<unknown>, party: string) =>
  beat.focus === party || beat.partner === party || Boolean(beat.touches?.includes(party));

/** Beats that started by `t` and showed or touched the party, oldest first. */
export function partyHistory<TData>(script: FocusFilmScript<TData>, party: string, t: number): FocusBeat<TData>[] {
  return script.beats.filter((beat) => beat.at <= t && namesParty(beat, party));
}

/** Parties off screen at `t` that a beat touched since they were last on screen. */
export function partiesWithNews(script: FocusFilmScript<unknown>, t: number): Set<string> {
  const news = new Set<string>();
  for (const beat of script.beats) {
    if (beat.at > t) break;
    for (const party of partiesOnScreen(beat)) news.delete(party);
    for (const party of beat.touches ?? []) news.add(party);
  }
  for (const party of partiesOnScreen(activeBeat(script, t))) news.delete(party);
  return news;
}

/**
 * Clock keyframes for beats that each hold one story moment. The clock stands still while a beat
 * plays, then races to the next beat's time in the last `raceMs` before it, so the time on screen
 * always matches the panels. A race of more than an hour eases, so it reads as a jump.
 */
export function clockForBeats(
  stops: { at: number; time: string }[],
  { durationMs, endTime, raceMs = 1200 }: { durationMs: number; endTime?: string; raceMs?: number },
): FilmClockKeyframe[] {
  const frames: FilmClockKeyframe[] = [];
  stops.forEach((stop, index) => {
    const previous = stops[index - 1];
    if (previous) {
      const holdUntil = Math.max(previous.at, stop.at - raceMs);
      frames.push({ at: holdUntil, time: previous.time, curve: "linear" });
      const long = parseStoryTime(stop.time) - parseStoryTime(previous.time) > 60 * 60_000;
      frames.push({ at: stop.at, time: stop.time, curve: long ? "ease" : "linear" });
    } else {
      frames.push({ at: stop.at, time: stop.time });
    }
  });
  const last = stops.at(-1);
  if (last && endTime) frames.push({ at: durationMs, time: endTime, curve: "linear" });
  return frames;
}
