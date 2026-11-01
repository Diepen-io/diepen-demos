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

test("a progress dot jumps to its beat @documents.controls", async ({ page }) => {
  await openFilm(page, `?t=${stepMoments[0]}`);
  await page.getByRole("button", { name: "Step 3 of 5" }).click();
  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "2");
  await expect(page.getByRole("button", { name: "Step 3 of 5" })).toHaveAttribute("aria-current", "step");
});
