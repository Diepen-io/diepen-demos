import { defaultPresetFor } from "@diepen/voice/presets";
import { expect, test } from "@playwright/test";
import { keynoteFilm, keynoteFinale, keynoteStep, stepMoment } from "./support/film-page";
import { expectNoHorizontalOverflow, gotoApp } from "./support/layout";
import { collectPageProblems } from "./support/page-problems";

test.describe.configure({ timeout: 60_000 });
// A missing element fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

const preset = defaultPresetFor("inbox");
const captions = ["Saturday, 22:14. A new DM.", "Answered in 38 seconds.", "Booked straight into your calendar.", "Edge cases go to you."];

test("F3: ?t= opens the four beats and the finale in order @inbox.film-controls", async ({ page }) => {
  for (const [step, caption] of [...captions, undefined].entries()) {
    await gotoApp(page, `/?t=${stepMoment(step)}`);
    await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", String(step));
    if (caption) await expect(keynoteStep(page).getByRole("heading")).toHaveText(caption);
  }
});

test("F1: the finale shows 9 h to 38 s and Try it yourself @inbox.film", async ({ page }) => {
  await gotoApp(page, `/?t=${stepMoment(4)}`);

  const finale = keynoteFinale(page);
  await expect(finale).toContainText("Reply time");
  await expect(finale).toContainText("9 h");
  await expect(finale).toContainText("38 s");
  await expect(finale.getByRole("link", { name: "Try it yourself" })).toBeVisible();
});

test("F19: ?record=1 names the company and marks it fictional @inbox.film", async ({ page }) => {
  await gotoApp(page, `/?t=${stepMoment(0)}&record=1`);

  const header = keynoteFilm(page).locator("header");
  await expect(header).toContainText(preset.name);
  await expect(header).toContainText("Fictional company");
});

for (const step of [0, 4]) {
  test(`F14: step ${step} fits a 375 px screen without sideways scrolling @inbox.film`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "A phone width check");
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoApp(page, `/?t=${stepMoment(step)}`);

    await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", String(step));
    await expectNoHorizontalOverflow(page, `step ${step}`);
  });
}

test("F15: / plays to the second beat with no console errors and no failed requests @inbox.film", async ({ page }) => {
  const problems = collectPageProblems(page);
  await gotoApp(page, "/");

  await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", "1", { timeout: 10_000 });
  expect(problems).toEqual([]);
});
