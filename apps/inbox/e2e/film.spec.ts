import { defaultPresetFor } from "@diepen/voice/presets";
import { expect, test } from "@playwright/test";
import { endCard, filmCaption, filmPanel, focusPanel, playPauseButton, speedButton, storyClock } from "./support/film-page";
import { expectNoHorizontalOverflow, gotoApp } from "./support/layout";
import { collectPageProblems } from "./support/page-problems";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

const preset = defaultPresetFor("inbox");

/** A moment inside each beat, after its transition: Ana, the offer, the booking, Priya, Tom, Daniel, 08:00. */
const beatMoments = [2000, 9500, 17_000, 24_500, 32_000, 39_500, 47_000];

test("F1: opens on the end card with the reply time numbers and the fictional note @inbox.film", async ({ page }) => {
  await gotoApp(page, "/?t=58000");

  const card = endCard(page);
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(card).toContainText("Reply time");
  await expect(card).toContainText("9 hours");
  await expect(card).toContainText("38 seconds");
  await expect(card).toContainText(preset.name);
  await expect(card).toContainText("fictional");
});

test("F2: plays from 20 s at 2x through Priya, Tom and Daniel to the end card @inbox.film", async ({ page }) => {
  await gotoApp(page, "/?t=20000");

  const speed = speedButton(page);
  await speed.click();
  await speed.click();
  await expect(speed).toHaveAccessibleName(/Speed 2 times/);
  await playPauseButton(page, "Play").click();

  for (const party of ["priya", "tom", "daniel", "owner"] as const) {
    await expect(filmPanel(page, party).and(focusPanel(page))).toBeVisible({ timeout: 30_000 });
  }
  await expect(endCard(page)).toBeVisible({ timeout: 30_000 });
});

test("F16: at 1920x1080 a beat shows its focus and partner side by side under a caption of at least 32 px @inbox.film", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The recording size is a desktop check");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await gotoApp(page, "/?t=9500");

  await expect(filmPanel(page, "ana")).toHaveAttribute("data-role", "focus");
  await expect(filmPanel(page, "calendar")).toHaveAttribute("data-role", "partner");
  const box = (id: "ana" | "calendar") =>
    filmPanel(page, id).evaluate((element) => {
      const { top, left, right, width } = element.getBoundingClientRect();
      return { top, left, right, width };
    });
  const [focus, partner] = await Promise.all([box("ana"), box("calendar")]);
  expect(Math.abs(focus.top - partner.top), "panels share one row").toBeLessThanOrEqual(1);
  expect(partner.left, "the partner sits right of the focus").toBeGreaterThanOrEqual(focus.right);
  expect(focus.width, "the focus is the larger panel").toBeGreaterThan(partner.width);

  const caption = filmCaption(page);
  await expect(caption).toHaveText("Two free mornings, straight from the calendar.");
  const fontSize = await caption.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(32);
});

test("F19: at the 1280x720 recording size every beat has at most two panels, one highlight and no text under 16 px @inbox.film", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The recording size is a desktop check");
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const t of beatMoments) {
    await gotoApp(page, `/?t=${t}&record=1`);
    await expect(focusPanel(page)).toHaveCount(1);
    expect(await page.locator("[data-film-panel]").count(), `panels at ${t}`).toBeLessThanOrEqual(2);
    await expect(page.locator("[data-highlighted]"), `highlights at ${t}`).toHaveCount(1);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("body *")].flatMap((element) => {
        const text = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        const box = element.getBoundingClientRect();
        if (!text || box.width === 0 || element.closest(".sr-only")) return [];
        const size = Number.parseFloat(getComputedStyle(element).fontSize);
        return size < 16 ? [`${size}px "${element.textContent?.trim().slice(0, 30)}"`] : [];
      }),
    );
    expect(small, `text under 16 px at ${t}`).toEqual([]);
  }
});

for (const path of ["/", "/?t=30000", "/?t=58000"]) {
  test(`F14: ${path} fits a 375 px screen without sideways scrolling @inbox.film`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "A phone width check");
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoApp(page, path);

    await expect(storyClock(page)).toBeVisible();
    if (path.includes("58000")) await expect(endCard(page)).toBeVisible();
    else await expect(page.locator("[data-film-panel]").filter({ visible: true })).toHaveCount(1);
    await expectNoHorizontalOverflow(page, path);
  });
}

test("F15: / plays with no console errors and no failed requests @inbox.film", async ({ page }) => {
  const problems = collectPageProblems(page);
  await gotoApp(page, "/");

  // The film autoplays; by 21:44 the first beat change has run.
  await expect(storyClock(page)).toHaveAccessibleName(/21:4[4-9]/, { timeout: 15_000 });
  expect(problems).toEqual([]);
});

test("F15: /?t=58000 shows the end card with no console errors and no failed requests @inbox.film", async ({ page }) => {
  const problems = collectPageProblems(page);
  await gotoApp(page, "/?t=58000");

  await expect(endCard(page)).toBeVisible();
  expect(problems).toEqual([]);
});
