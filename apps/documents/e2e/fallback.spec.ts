import { expect, test } from "./support/documents-test";
import { openUploadPage, useSample } from "./support/live-page";
import { samples } from "./support/samples";

// The browser logs the 429 as a failed resource load; that error is the point of this test.
test.use({ allowedConsoleErrors: [/status of 429/] });

test("a tripped cost guard swaps the live page to the film with a note @documents.fallback", async ({ page }) => {
  await page.route("**/api/check", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        fallback: "film",
        reason: "daily_cap",
        message: "The live demo is busy today. Here is the recorded film.",
      }),
    }),
  );

  await openUploadPage(page);
  await useSample(page, samples.payslip);

  await expect(page.getByRole("status").filter({ hasText: "Live answers are paused for now." })).toBeVisible();
  await expect(page.locator('[data-keynote-film="documents"]')).toBeVisible();
});
