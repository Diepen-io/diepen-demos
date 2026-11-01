import type { Page } from "@playwright/test";
import { clockTime, lane, minutesOf, setSpeed, storyClock } from "./support/film";
import { expect, test } from "./support/test";

/**
 * From 17,000 the story clock races from 14:01 to 14:18 in 2.8 s of film, so one second of play
 * moves the HH:MM display by several minutes.
 */
const racingStart = "/?t=17000";

/** Plays for one second from the racing start and returns how many story minutes passed. */
async function minutesInOneSecond(page: Page, speed: number): Promise<number> {
  await page.goto(racingStart);
  await expect(storyClock(page)).toContainText("14:01");
  await setSpeed(page, speed);
  const before = minutesOf(await clockTime(page));
  await page.getByRole("button", { name: "Play" }).click();
  await page.waitForTimeout(1_000);
  await page.getByRole("button", { name: "Pause" }).click();
  return minutesOf(await clockTime(page)) - before;
}

// F3
test("pause holds the clock and play moves it @meetings.film-controls", async ({ page }) => {
  await page.goto(racingStart);
  await expect(storyClock(page)).toContainText("14:01");
  await page.getByRole("button", { name: "Play" }).click();
  await page.waitForTimeout(1_000);
  await page.getByRole("button", { name: "Pause" }).click();
  const paused = await storyClock(page).textContent();
  expect(minutesOf(await clockTime(page))).toBeGreaterThan(minutesOf("14:01"));

  await page.waitForTimeout(1_000);
  expect(await storyClock(page).textContent()).toBe(paused);
});

test("restart goes back to 14:00 and the first line @meetings.film-controls", async ({ page }) => {
  await page.goto("/?t=40000");
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(storyClock(page)).toContainText("14:00");
  await expect(lane(page, "call")).toContainText("Hi Tom");
  await expect(lane(page, "call")).not.toContainText("14 apartments");
});

test("2x moves the clock further in a second than 1x @meetings.film-controls", async ({ page }) => {
  const atNormalSpeed = await minutesInOneSecond(page, 1);
  const atDoubleSpeed = await minutesInOneSecond(page, 2);
  expect(atNormalSpeed).toBeGreaterThan(0);
  expect(atDoubleSpeed).toBeGreaterThan(atNormalSpeed);
});

// F4
test("opens at 49,000 with the proposal in its lane and the clock at 14:33 @meetings.film-controls", async ({ page }) => {
  await page.goto("/?t=49000");
  await expect(storyClock(page)).toContainText("14:33");
  await expect(lane(page, "proposal")).toBeVisible();
  await expect(lane(page, "proposal")).toContainText("Full rental management for Becker Residential");
});
