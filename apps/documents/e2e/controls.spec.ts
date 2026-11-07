import { expect, test } from "./support/documents-test";
import { keynoteStep, openFilm, stepMoments } from "./support/film-page";

test("play moves on to the next beat and pause holds it @documents.controls", async ({ page }) => {
  await openFilm(page, `?t=${stepMoments[0]}`);
  await page.getByRole("button", { name: "Play" }).click();
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "1", { timeout: 5000 });
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForTimeout(3500);
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "1");
});

test("Next, Previous and a dot go to a beat, and a paused film stays paused @documents.controls", async ({ page }) => {
  await openFilm(page, `?t=${stepMoments[0]}`);
  const next = page.getByRole("button", { name: "Next beat" });
  const previous = page.getByRole("button", { name: "Previous beat" });
  await expect(previous).toBeDisabled();

  await next.click();
  await next.click();
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "2");
  await previous.click();
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "1");

  const dots = page.getByRole("list", { name: "Film beats" }).getByRole("button");
  await expect(dots).toHaveCount(5);
  await dots.nth(3).click();
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "3");
  await expect(dots.nth(3)).toHaveAttribute("aria-current", "step");
  await expect(dots.nth(3)).toHaveAccessibleName(/^Beat 4 of 5: /);

  // Paused before, so it stays on the beat.
  await page.waitForTimeout(3500);
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "3");
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
});

test("the arrow keys step through the beats and Space plays @documents.controls", async ({ page }) => {
  // The server renders step 0; step 1 shows once the page runs, so the keys reach a live film.
  await openFilm(page, `?t=${stepMoments[1]}`);
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "1");
  await page.keyboard.press("ArrowRight");
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "2");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "2");
  await page.keyboard.press(" ");
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
});

test("film controls are at least 44 px tall @documents.controls", async ({ page }) => {
  await openFilm(page, `?t=${stepMoments[0]}`);
  for (const name of ["Previous beat", "Play", "Next beat"]) {
    expect((await page.getByRole("button", { name }).boundingBox())?.height, name).toBeGreaterThanOrEqual(44);
  }
});
