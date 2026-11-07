import { presets } from "@diepen/voice/presets";
import { expect, test } from "./support/documents-test";
import { captions, keynoteStep, openFilm, stepMoments } from "./support/film-page";
import { recordApiRequests } from "./support/live-page";

const firm = presets["ledgerwick-accounting"];

test("shows the four beats and the finale in order without a live request @documents.film", async ({ page }) => {
  const checks = recordApiRequests(page, "/api/check");
  const chases = recordApiRequests(page, "/api/chase");

  for (const [step, t] of stepMoments.entries()) {
    await openFilm(page, `?t=${t}`);
    await expect(keynoteStep(page)).toHaveAttribute("data-keynote-step", String(step));
    const caption = captions[step];
    if (caption) await expect(keynoteStep(page).getByRole("heading", { name: caption })).toBeVisible();
  }
  expect([...checks, ...chases]).toEqual([]);
});

test("the finale shows 12 h to 1 h and links to live mode @documents.film", async ({ page }) => {
  await openFilm(page, `?t=${stepMoments[4]}`);
  const finale = page.locator("[data-keynote-finale]");
  await expect(finale.getByText("Hours a month chasing documents")).toBeVisible();
  await expect(finale.getByText("12 h", { exact: true })).toBeVisible();
  await expect(finale.getByText("1 h", { exact: true })).toBeVisible();
  await expect(finale).toContainText(`${firm.name}, a fictional firm`);
  await expect(finale.getByRole("link", { name: "Try it yourself" })).toHaveAttribute("href", /^\/live/);
});

test("?record=1 names the fictional firm and hides the play button @documents.film", async ({ page }) => {
  await openFilm(page, `?record=1&t=${stepMoments[0]}`);
  await expect(page.getByText(firm.name, { exact: true })).toBeVisible();
  await expect(page.getByText("Fictional company")).toBeVisible();
  await expect(page.getByRole("button", { name: /^(Play|Pause|Replay)$/ })).toHaveCount(0);
});
