import { storyClock } from "./support/film";
import { inputTab, transcriptBox, turnIntoProposal } from "./support/live";
import { expect, test } from "./support/test";

// F12
test("lands on the film with the fallback note when a cost guard trips @meetings.limit-fallback", async ({ page, consoleGuard }) => {
  consoleGuard.allow(/status of 429/);
  await page.route("**/api/outputs", (route) =>
    route.fulfill({
      status: 429,
      json: { fallback: "film", reason: "daily_cap", message: "The live demo is busy today. Here is the recorded film." },
    }),
  );
  await page.goto("/live");
  await inputTab(page, "Sample call").click();
  await expect(transcriptBox(page)).not.toHaveValue("");
  await turnIntoProposal(page).click();

  await expect(page).toHaveURL(/\/\?(.+&)?fallback=limit(&|$)/);
  await expect(page.getByRole("status").filter({ hasText: "Live answers are paused" })).toBeVisible();
  await expect(storyClock(page)).toBeVisible();
});
