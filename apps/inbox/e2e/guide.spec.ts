import { expect, test, type Page } from "@playwright/test";
import { openLive } from "./support/live-page";

test.describe.configure({ timeout: 90_000 });

const guide = (page: Page) => page.getByRole("region", { name: "Next step" });

test("the guide leads through a booking and a refund to the end @inbox.guide", async ({ page }) => {
  await openLive(page);
  await expect(guide(page)).toHaveAttribute("data-guide-step", "ask-time");
  await guide(page).getByRole("button").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "pick-time");
  await page.locator("[data-spotlight]").getByRole("button").first().click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "ask-refund");
  await guide(page).getByRole("button").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "end");
  await expect(guide(page).getByRole("link", { name: "Watch the film" })).toBeVisible();
  await guide(page).getByRole("button", { name: "Start over" }).click();
  await expect(guide(page)).toHaveAttribute("data-guide-step", "ask-time");
});
