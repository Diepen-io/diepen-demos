import type { Locator, Page } from "@playwright/test";

/** The story clock. Its text shows the story time as HH:MM. */
export function storyClock(page: Page): Locator {
  return page.getByRole("timer");
}

/** The story time the clock shows, as "14:33". */
export async function clockTime(page: Page): Promise<string> {
  const text = (await storyClock(page).textContent()) ?? "";
  return /\d{2}:\d{2}/.exec(text)?.[0] ?? "";
}

export function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function lane(page: Page, id: "call" | "ai" | "crm" | "proposal" | "calendar"): Locator {
  return page.locator(`[data-lane="${id}"]`);
}

/** The end card, found by its metric heading. */
export function endCard(page: Page): Locator {
  return page.getByRole("region", { name: "Call end to proposal sent" });
}

/** Clicks the speed control until the film plays at `speed` times. */
export async function setSpeed(page: Page, speed: number) {
  const control = page.getByRole("button", { name: /Change speed/ });
  for (let tries = 0; tries < 4; tries++) {
    if ((await control.getAttribute("aria-label"))?.startsWith(`Speed ${speed} times`)) return;
    await control.click();
  }
  throw new Error(`The film has no speed ${speed}`);
}
