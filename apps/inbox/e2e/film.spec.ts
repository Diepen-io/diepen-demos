import { defaultPresetFor } from "@diepen/voice/presets";
import { expect, test } from "@playwright/test";
import { endCard, filmCaption, filmChannelTab, filmLane, playPauseButton, speedButton, storyClock } from "./support/film-page";
import { expectNoHorizontalOverflow, gotoApp } from "./support/layout";
import { collectPageProblems } from "./support/page-problems";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

const preset = defaultPresetFor("inbox");

test("F1: opens on the end card with the reply time numbers and the fictional note @inbox.film", async ({ page }) => {
  await gotoApp(page, "/?t=80000");

  const card = endCard(page);
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(card).toContainText("Reply time");
  await expect(card).toContainText("7 hours");
  await expect(card).toContainText("30 seconds");
  await expect(card).toContainText(preset.name);
  await expect(card).toContainText("fictional");
});

test("F2: plays from 20 s at 2x through Instagram, LinkedIn and Website chat to the end card @inbox.film", async ({ page }) => {
  await gotoApp(page, "/?t=20000");

  const speed = speedButton(page);
  await speed.click();
  await speed.click();
  await expect(speed).toHaveAccessibleName(/Speed 2 times/);
  await playPauseButton(page, "Play").click();

  for (const label of ["Instagram", "LinkedIn", "Website chat"]) {
    await expect(filmChannelTab(page, label)).toHaveAttribute("aria-selected", "true", { timeout: 30_000 });
  }
  await expect(endCard(page)).toBeVisible({ timeout: 30_000 });
});

test("F16: at 1920x1080 shows the four lanes side by side and a caption of about 28 px @inbox.film", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The recording size is a desktop check");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await gotoApp(page, "/?t=7000");

  const lanes = page.locator("[data-film-lane]");
  await expect(lanes).toHaveCount(4);
  for (const id of ["customers", "ai", "calendar", "owner"] as const) await expect(filmLane(page, id)).toBeVisible();
  const boxes = await lanes.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right };
    }),
  );
  boxes.forEach((box, index) => {
    const previous = boxes[index - 1];
    if (!previous) return;
    expect(Math.abs(box.top - previous.top), "lanes share one row").toBeLessThanOrEqual(1);
    expect(box.left, "each lane starts right of the one before").toBeGreaterThanOrEqual(previous.right);
  });

  const caption = filmCaption(page);
  await expect(caption).toBeVisible();
  const fontSize = await caption.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  // The shared caption bar scales with the viewport: 1.45vw, which is 27.8 px at 1920 wide.
  expect(fontSize).toBeGreaterThanOrEqual(27.5);
});

for (const path of ["/", "/?t=30000", "/?t=80000"]) {
  test(`F14: ${path} fits a 375 px screen without sideways scrolling @inbox.film`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "A phone width check");
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoApp(page, path);

    await expect(storyClock(page)).toBeVisible();
    if (path.includes("80000")) await expect(endCard(page)).toBeVisible();
    await expectNoHorizontalOverflow(page, path);
  });
}

test("F15: / plays with no console errors and no failed requests @inbox.film", async ({ page }) => {
  const problems = collectPageProblems(page);
  await gotoApp(page, "/");

  // The film autoplays; by 21:42 the first message and its travel have run.
  await expect(storyClock(page)).toHaveAccessibleName(/21:4[2-9]/, { timeout: 15_000 });
  expect(problems).toEqual([]);
});

test("F15: /?t=80000 shows the end card with no console errors and no failed requests @inbox.film", async ({ page }) => {
  const problems = collectPageProblems(page);
  await gotoApp(page, "/?t=80000");

  await expect(endCard(page)).toBeVisible();
  expect(problems).toEqual([]);
});
