import type { ReactNode } from "react";

/**
 * A keynote film: one element on screen per beat, like a product shot. Each beat has a short
 * caption, one element and at most one status chip. The last beat is the finale number.
 */
export type KeynoteChipTone = "neutral" | "pass" | "wait" | "fail" | "brand";

export type KeynoteBeat = {
  id: string;
  /** At most 6 words. */
  caption: string;
  /** The one element on screen. */
  element: ReactNode;
  chip?: { label: string; tone?: KeynoteChipTone };
};

export type KeynoteFinale = {
  /** What the number measures, for example "Reply time". */
  label: string;
  before: string;
  after: string;
  /** One line that says the numbers come from a simulation with a fictional company. */
  note: string;
};

export type KeynoteFilm = {
  id: string;
  title: string;
  beats: KeynoteBeat[];
  finale: KeynoteFinale;
  /** How long each beat, and the finale, stays on screen. */
  beatMs?: number;
};

export const KEYNOTE_MAX_CAPTION_WORDS = 6;
export const KEYNOTE_DEFAULT_BEAT_MS = 3200;

/** Checks the rules a keynote film must follow, so a script that breaks them fails its unit test. */
export function defineKeynoteFilm(film: KeynoteFilm): KeynoteFilm {
  if (film.beats.length < 1 || film.beats.length > 4) {
    throw new Error(`${film.id}: a keynote film has 1 to 4 beats before its finale, not ${film.beats.length}.`);
  }
  for (const beat of film.beats) {
    const words = beat.caption.trim().split(/\s+/).length;
    if (words > KEYNOTE_MAX_CAPTION_WORDS) {
      throw new Error(`${film.id}/${beat.id}: the caption has ${words} words, at most ${KEYNOTE_MAX_CAPTION_WORDS}.`);
    }
    if (/[–—]/.test(beat.caption)) throw new Error(`${film.id}/${beat.id}: no en or em dashes in captions.`);
  }
  return film;
}

export function keynoteBeatMs(film: KeynoteFilm): number {
  return film.beatMs ?? KEYNOTE_DEFAULT_BEAT_MS;
}

/** The beats and the finale, each on screen for one beat length. */
export function keynoteDurationMs(film: KeynoteFilm): number {
  return (film.beats.length + 1) * keynoteBeatMs(film);
}

/** Which step is on screen at film time `t`: a beat index, or `beats.length` for the finale. */
export function keynoteStepAt(film: KeynoteFilm, t: number): number {
  const step = Math.floor(Math.max(0, t) / keynoteBeatMs(film));
  return Math.min(step, film.beats.length);
}
