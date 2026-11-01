import type { Locator, Page } from "@playwright/test";
import { expect } from "./documents-test";

/**
 * Drives the film on `/` through the controls of @diepen/ui. The controls fade out while the film
 * plays and the pointer rests, so every click wakes them first.
 */

export async function openFilm(page: Page, query = ""): Promise<void> {
  await page.goto(`/${query}`);
  await expect(filmPosition(page)).toBeVisible();
}

export function filmPosition(page: Page): Locator {
  return page.getByRole("slider", { name: "Film position" });
}

export function storyClock(page: Page): Locator {
  return page.getByRole("timer");
}

export async function wakeControls(page: Page): Promise<void> {
  await page.mouse.move(12, 12);
  await page.mouse.move(24, 24);
}

export async function pressControl(page: Page, name: string | RegExp): Promise<void> {
  await wakeControls(page);
  await page.getByRole("button", { name }).click();
}

export async function positionMs(page: Page): Promise<number> {
  return Number(await filmPosition(page).inputValue());
}

export function speedButton(page: Page): Locator {
  return page.getByRole("button", { name: /^Speed .+ times\. Change speed$/ });
}

/** Cycles the speed button until it shows the wanted speed. */
export async function setSpeed(page: Page, speed: number): Promise<void> {
  const wanted = `Speed ${speed} times. Change speed`;
  for (let step = 0; step < 4; step++) {
    if ((await speedButton(page).getAttribute("aria-label")) === wanted) return;
    await pressControl(page, /^Speed .+ times\. Change speed$/);
  }
  await expect(speedButton(page)).toHaveAttribute("aria-label", wanted);
}

/** The text of the clock plus its accessible name, for example "Story time Mon 12:47". */
export async function clockReading(page: Page): Promise<string> {
  const clock = storyClock(page);
  return `${await clock.getAttribute("aria-label")} | ${await clock.textContent()}`;
}
