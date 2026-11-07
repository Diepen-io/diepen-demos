import { presets } from "@diepen/voice/presets";
import { beatMs, keynoteStep } from "./support/film";
import { runSampleCall } from "./support/live";
import { expect, test } from "./support/test";

const company = presets["brickfern-property"].name;

/** What each step shows, in order: four beats, then the finale. */
const steps = [
  ["The call ends.", "Call with Tom Becker"],
  ["The numbers, pulled from the call.", "Days empty"],
  ["Proposal drafted.", "EUR 34 per unit per month"],
  ["Sent 4 minutes later.", "Sent 14:36"],
  ["Call end to proposal sent", "Try it yourself"],
] as const;

// F1, F4
test("opens each of the five steps in order with ?t= @meetings.film-controls", async ({ page }) => {
  for (const [index, texts] of steps.entries()) {
    await page.goto(`/?t=${index * beatMs + 400}`);
    await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", String(index));
    for (const text of texts) await expect(keynoteStep(page)).toContainText(text);
  }
});

// F2
test("ends on 2 days to 4 min with a link to live mode, with every API request blocked @meetings.film", async ({ page }) => {
  await page.route("**/api/**", (route) =>
    new URL(route.request().url()).pathname === "/api/health" ? route.continue() : route.abort(),
  );
  await page.goto(`/?t=${3 * beatMs}`);
  await page.getByRole("button", { name: "Play" }).click();
  const finale = page.locator("[data-keynote-finale]");
  await expect(finale).toBeVisible({ timeout: 10_000 });
  await expect(finale).toContainText("2 days");
  await expect(finale).toContainText("4 min");
  await expect(finale.getByRole("link", { name: "Try it yourself" })).toHaveAttribute("href", /\/live/);
});

// F3
test("shows the company and its fictional badge in a recording @meetings.film", async ({ page }) => {
  await page.goto("/?record=1&t=0");
  await expect(page.getByRole("button", { name: "Make it yours" })).toHaveCount(0);
  await expect(page.locator("[data-keynote-film]")).toContainText(company);
  await expect(page.getByText("Fictional company")).toBeVisible();
});

// F16
test("never scrolls sideways at 375 px, in the film or in live mode @meetings.film", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Runs at phone width only");
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 375, height: 812 });
  const scrollWidth = () => page.evaluate(() => document.documentElement.scrollWidth);

  for (const step of steps.keys()) {
    await page.goto(`/?t=${step * beatMs + 400}`);
    await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", String(step));
    expect(await scrollWidth(), `step ${step}`).toBeLessThanOrEqual(375);
  }
  await page.goto("/live");
  expect(await scrollWidth(), "/live").toBeLessThanOrEqual(375);
  await runSampleCall(page);
  expect(await scrollWidth(), "/live with all six outputs").toBeLessThanOrEqual(375);
});
