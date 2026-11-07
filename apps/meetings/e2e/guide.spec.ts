import type { Page } from "@playwright/test";
import { outputTimeout } from "./support/live";
import { removeSpeechRecognition } from "./support/speech";
import { expect, test } from "./support/test";

const guide = (page: Page) => page.getByRole("region", { name: "Next step" });

test("the guide leads from the sample call to the sent email @meetings.guide", async ({ page }) => {
  await removeSpeechRecognition(page);
  await page.goto("/live");
  await expect(guide(page)).toHaveAttribute("data-guide-step", "load");
  await guide(page).getByRole("button").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "submit");
  await page.locator("[data-spotlight]").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "send", { timeout: outputTimeout });
  await page.locator("[data-spotlight]").click();

  await expect(guide(page)).toHaveAttribute("data-guide-step", "end");
  await expect(guide(page).getByRole("link", { name: "Watch the film" })).toBeVisible();
});
