import { expect, test } from "./support/documents-test";
import { clockReading, openFilm, positionMs, pressControl, setSpeed, storyClock } from "./support/film-page";
import { firmRow } from "./support/live-page";
import { showLane } from "./support/lanes";

test("pause holds the clock for a second @documents.controls", async ({ page }) => {
  // 4,500 ms is where three and a half story hours pass in two and a half seconds.
  await openFilm(page, "?t=4500");
  await pressControl(page, "Play");
  await page.waitForTimeout(500);
  await pressControl(page, "Pause");
  const paused = await clockReading(page);
  const position = await positionMs(page);
  await page.waitForTimeout(1000);
  expect(await clockReading(page)).toBe(paused);
  expect(await positionMs(page)).toBe(position);
});

test("play moves the clock @documents.controls", async ({ page }) => {
  await openFilm(page, "?t=4500");
  const before = await clockReading(page);
  await pressControl(page, "Play");
  await expect.poll(() => clockReading(page), { timeout: 3000 }).not.toBe(before);
});

test("restart shows Mon 9 Mar, 09:00 and the first caption @documents.controls", async ({ page }) => {
  await openFilm(page, "?t=30000");
  await pressControl(page, "Restart");
  await expect(storyClock(page)).toHaveAccessibleName("Story time Mon 09:00");
  await expect(storyClock(page)).toContainText("9 Mar");
  await expect(page.getByText(/needs 6 documents/)).toBeVisible();
});

test("each speed setting changes the pace @documents.controls", async ({ page }) => {
  test.setTimeout(60_000);
  await openFilm(page, "?t=1000");
  await pressControl(page, "Play");

  const pace: Record<number, number> = {};
  for (const speed of [0.5, 1, 1.5, 2]) {
    await setSpeed(page, speed);
    const startMs = await positionMs(page);
    const startedAt = Date.now();
    await page.waitForTimeout(1200);
    pace[speed] = ((await positionMs(page)) - startMs) / (Date.now() - startedAt);
  }

  const [half = 0, one = 0, oneAndHalf = 0, two = 0] = [pace[0.5], pace[1], pace[1.5], pace[2]];
  expect(half).toBeGreaterThan(0);
  expect(one).toBeGreaterThan(half);
  expect(oneAndHalf).toBeGreaterThan(one);
  expect(two).toBeGreaterThan(oneAndHalf);
  expect(two / half).toBeGreaterThan(2.5);
});

/**
 * Check 23 names `?t=27000`, but beat 19 starts at 26,300 ms and travels for the default 800 ms,
 * so it lands at 27,100 ms. At 27,200 ms it has landed, and the wrong-year caption
 * and the clock at 12:47 still show.
 */
test("opens at a moment after the wrong-year statement reached the firm @documents.controls", async ({ page }) => {
  await openFilm(page, "?t=27200");
  await expect(page.getByText(/Wrong year caught/)).toBeVisible();
  await expect(storyClock(page)).toHaveAccessibleName("Story time Mon 12:47");
  await showLane(page, "firm");
  await expect(firmRow(page, "bank-interest").getByText("Problem found", { exact: true })).toBeVisible();
});
