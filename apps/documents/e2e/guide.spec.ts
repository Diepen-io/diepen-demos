import type { Page } from "@playwright/test";
import { expect, test } from "./support/documents-test";
import { lane, laneTabs, showLane } from "./support/lanes";

/** The live guide's bar. `data-guide-step` names the current step. */
const guide = (page: Page) => page.getByRole("region", { name: "Next step" });

test("the guide leads from the request email to the escalation, one step at a time @documents.guide", async ({ page }) => {
  await page.goto("/live");
  await expect(guide(page)).toHaveAttribute("data-guide-step", "open-email");
  await expect(page.locator("[data-spotlight]")).toHaveCount(1);

  for (const step of ["open-email", "open-upload", "send-file"]) {
    await expect(guide(page)).toHaveAttribute("data-guide-step", step);
    await page.locator("[data-spotlight]").click();
  }
  await page.getByRole("menuitem").first().click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "done");
  await page.locator("[data-spotlight]").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "skip-1");
  const skip = guide(page).getByRole("button");
  expect((await skip.boundingBox())?.height, "guide button height in px").toBeGreaterThanOrEqual(44);
  await skip.click();
  await expect(guide(page)).toHaveAttribute("data-guide-step", "skip-2");
  await guide(page).getByRole("button").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "end-escalated");
  await expect(guide(page).getByRole("link", { name: "Watch the film" })).toHaveAttribute("href", /^\/(\?|$)/);
  await guide(page).getByRole("button", { name: "Start over" }).click();
  await expect(guide(page)).toHaveAttribute("data-guide-step", "open-email");
});

test("on a phone the guide brings Daniel's phone back when another lane is open @documents.guide", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Only the phone layout hides lanes");
  await page.goto("/live");
  await expect(laneTabs(page)).toBeVisible();
  await showLane(page, "firm");
  await guide(page).getByRole("button").click();
  await expect(lane(page, "client")).toBeVisible();
  await expect(page.locator("[data-spotlight]")).toBeVisible();
});
