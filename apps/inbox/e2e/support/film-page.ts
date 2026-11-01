import type { Locator, Page } from "@playwright/test";

/** How long each keynote step stays on screen (`KEYNOTE_DEFAULT_BEAT_MS`). */
export const beatMs = 3200;

/** Film time in the middle of a step: 0 to 3 are the beats, 4 is the finale. */
export function stepMoment(step: number): number {
  return step * beatMs + beatMs / 2;
}

/** The keynote stage, named by the film title. */
export function keynoteFilm(page: Page): Locator {
  return page.locator("[data-keynote-film]");
}

/** The step on screen. Its `data-keynote-step` holds the step index. */
export function keynoteStep(page: Page): Locator {
  return page.locator("[data-keynote-step]");
}

/** The finale: the one number, before and after, and "Try it live". */
export function keynoteFinale(page: Page): Locator {
  return page.locator("[data-keynote-finale]");
}
