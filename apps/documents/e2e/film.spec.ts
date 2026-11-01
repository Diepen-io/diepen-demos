import { expect, test } from "./support/documents-test";
import { filmPosition, openFilm, setSpeed, wakeControls } from "./support/film-page";
import { recordApiRequests } from "./support/live-page";

test("plays to the end card at the fastest speed without a live request @documents.film", async ({ page }) => {
  test.setTimeout(120_000);
  const checks = recordApiRequests(page, "/api/check");
  const chases = recordApiRequests(page, "/api/chase");

  await openFilm(page);
  await setSpeed(page, 2);

  await expect(page.getByRole("heading", { name: "Hours a month spent chasing documents" })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("12 hours", { exact: true })).toBeVisible();
  await expect(page.getByText("1 hour", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Simulation with a fictional firm/)).toBeVisible();
  expect([...checks, ...chases]).toEqual([]);
});

test("shows no console error or page error from the first to the last frame @documents.film @documents.upload", async ({ page }) => {
  test.setTimeout(90_000);
  await openFilm(page, "?t=0");
  const slider = filmPosition(page);
  await wakeControls(page);
  await slider.focus();
  // Each arrow press seeks 5 seconds, so 15 presses cross the whole 72 second film.
  for (let step = 0; step < 15; step++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(250);
  }
  await expect(page.getByRole("heading", { name: "Hours a month spent chasing documents" })).toBeVisible();
});
