import type { Locator, Page } from "@playwright/test";

export type FilmLaneId = "customers" | "ai" | "calendar" | "owner";

/** One lane of the film. The film engine marks each lane section with its id. */
export function filmLane(page: Page, id: FilmLaneId): Locator {
  return page.locator(`[data-film-lane="${id}"]`);
}

/** The story clock. Its accessible name reads like "Story time Wed 06:34". */
export function storyClock(page: Page): Locator {
  return page.getByRole("timer");
}

/** The end card, named by its metric. */
export function endCard(page: Page): Locator {
  return page.getByRole("region", { name: "Reply time" });
}

/** The caption under the stage. The engine's caption bar is the polite live region that holds one paragraph. */
export function filmCaption(page: Page): Locator {
  return page.locator('[aria-live="polite"] > p').first();
}

/** A channel tab in the customers lane. On a phone the lane can be hidden, so hidden tabs count too. */
export function filmChannelTab(page: Page, label: string): Locator {
  return filmLane(page, "customers").getByRole("tab", { name: new RegExp(`^${label}`), includeHidden: true });
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
