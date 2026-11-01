import type { Page } from "@playwright/test";
import { endCard, lane, setSpeed } from "./support/film";
import { runSampleCall } from "./support/live";
import { expect, test } from "./support/test";

const laneIds = ["call", "ai", "crm", "proposal", "calendar"] as const;

async function expectEndCard(page: Page, timeout: number) {
  const card = endCard(page);
  await expect(card).toBeVisible({ timeout });
  await expect(card).toContainText("2 days");
  await expect(card).toContainText("4 minutes");
  await expect(card).toContainText(/fictional/i);
}

// F1. The film offers speeds up to 2x, so the fastest playthrough of the 67 s to the end card takes about 34 s.
test("plays from the start to the end card at the fastest speed @meetings.film", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await setSpeed(page, 2);
  await expectEndCard(page, 45_000);
});

// F2
test("plays to the end card with every API request blocked @meetings.film", async ({ page }) => {
  await page.route("**/api/**", (route) =>
    new URL(route.request().url()).pathname === "/api/health" ? route.continue() : route.abort(),
  );
  await page.goto("/?t=60000");
  await page.getByRole("button", { name: "Play" }).click();
  await expectEndCard(page, 20_000);
});

// F16
test("never scrolls sideways at 375 px, in the film or in live mode @meetings.film", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Runs at phone width only");
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 375, height: 812 });
  const scrollWidth = () => page.evaluate(() => document.documentElement.scrollWidth);

  for (const path of ["/", "/?t=40000", "/?t=70000", "/live"]) {
    await page.goto(path);
    await expect(page.getByRole("main").first()).toBeVisible();
    expect(await scrollWidth(), path).toBeLessThanOrEqual(375);
  }
  await runSampleCall(page);
  expect(await scrollWidth(), "/live with all six outputs").toBeLessThanOrEqual(375);
});

// F17
for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
]) {
  test(`shows all five lanes without page scroll at ${viewport.width}x${viewport.height} @meetings.film`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Runs at desktop sizes only");
    await page.setViewportSize(viewport);
    await page.goto("/?t=63000");
    for (const id of laneIds) await expect(lane(page, id)).toBeInViewport();
    const size = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(size.scrollHeight).toBeLessThanOrEqual(viewport.height);
    expect(size.scrollWidth).toBeLessThanOrEqual(viewport.width);
  });
}
