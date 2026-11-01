import type { Locator, Page } from "@playwright/test";
import { expect } from "./documents-test";

/**
 * Drives the keynote film on `/`: four beats and a finale, each on screen for one beat length.
 * `?t=<ms>` holds the film still at that moment.
 */

export const beatMs = 3200;

/** A moment in the middle of each step, so a fade never sits on the frame a test reads. */
export const stepMoments = [0, 1, 2, 3, 4].map((step) => step * beatMs + beatMs / 2);

export const captions = [
  "Your client uploads 6 files.",
  "Each one checked automatically.",
  "Problems caught instantly.",
  "Reminders go out on their own.",
];

export function keynoteStep(page: Page): Locator {
  return page.locator("[data-keynote-step]");
}

export async function openFilm(page: Page, query = ""): Promise<void> {
  await page.goto(`/${query}`);
  await expect(page.locator('[data-keynote-film="documents"]')).toBeVisible();
}
