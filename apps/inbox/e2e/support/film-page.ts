import type { Locator, Page } from "@playwright/test";

export type FilmPartyId = "ana" | "priya" | "tom" | "daniel" | "calendar" | "owner";

/** One party's panel. The film engine marks each panel with its party and its role, "focus" or "partner". */
export function filmPanel(page: Page, id: FilmPartyId): Locator {
  return page.locator(`[data-film-panel="${id}"]`);
}

/** The panel of the party the beat is about. */
export function focusPanel(page: Page): Locator {
  return page.locator('[data-film-panel][data-role="focus"]');
}

/** The story clock. Its accessible name reads like "Story time Wed 00:33". */
export function storyClock(page: Page): Locator {
  return page.getByRole("timer");
}

/** The end card, named by its metric. */
export function endCard(page: Page): Locator {
  return page.getByRole("region", { name: "Reply time" });
}

/** The caption above the panels: the polite live region that holds one paragraph. */
export function filmCaption(page: Page): Locator {
  return page.locator('[aria-live="polite"] > p').first();
}

/**
 * Clicks a film control. While the film plays and the pointer rests, the stage hides its
 * controls from the pointer, so the mouse moves first, the way a viewer's would.
 */
export async function clickFilmControl(page: Page, control: Locator): Promise<void> {
  await page.mouse.move(2, 2);
  await page.mouse.move(4, 4);
  await control.click();
}

export function playPauseButton(page: Page, name: "Play" | "Pause"): Locator {
  return page.getByRole("button", { name, exact: true });
}

export function restartButton(page: Page): Locator {
  return page.getByRole("button", { name: "Restart", exact: true });
}

/** The speed button. Its accessible name reads like "Speed 1.5 times. Change speed". */
export function speedButton(page: Page): Locator {
  return page.getByRole("button", { name: /Change speed/ });
}
