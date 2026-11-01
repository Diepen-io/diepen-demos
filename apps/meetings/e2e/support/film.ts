import type { Locator, Page } from "@playwright/test";

/** The keynote's length per beat: `?t=` with a multiple of it opens on that step. */
export const beatMs = 3200;

/** The step on screen: one of the four beats, or the finale. */
export function keynoteStep(page: Page): Locator {
  return page.locator("[data-keynote-step]");
}
