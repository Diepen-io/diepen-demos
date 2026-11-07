import { expectAllOutputs, inputTab, output, rosaCall, transcriptBox, turnIntoProposal } from "./support/live";
import { expect, test } from "./support/test";

// A flow waits for a dev compile, then up to 30 s per output (`outputTimeout`) and the 700 ms reveal steps; a loaded machine needs the margin.
test.describe.configure({ timeout: 90_000 });

// F6
test("turns a pasted call into six outputs for its prospect @meetings.live-paste", async ({ page }) => {
  await page.goto("/live");
  await inputTab(page, "Paste").click();
  await transcriptBox(page).fill(rosaCall);
  await turnIntoProposal(page).click();
  await expectAllOutputs(page);

  await expect(output(page, "crm")).toContainText("Rosa Lindqvist");
  await expect(output(page, "numbers")).toContainText("12");
  await expect(output(page, "numbers")).toContainText("40");
});

// F7
test("holds back a paste under 20 words and counts up to 30,000 characters @meetings.live-paste", async ({ page }) => {
  await page.goto("/live");
  await inputTab(page, "Paste").click();

  await transcriptBox(page).fill("Rosa Lindqvist: We own twelve flats near the old harbour wall.");
  await expect(turnIntoProposal(page)).toBeDisabled();
  await expect(page.getByText("Add a bit more of the call. It needs at least 20 words.")).toBeVisible();

  await transcriptBox(page).fill(`Rosa Lindqvist: ${"rent ".repeat(6000)}`.slice(0, 29_999) + "x");
  await expect(page.getByText("30,000 / 30,000")).toBeVisible();
});

// F13
test("says the draft failed on a 503, and Try again recovers @meetings.live-paste", async ({ page, consoleGuard }) => {
  consoleGuard.allow(/status of 503/);
  await page.route("**/api/outputs", (route) =>
    route.fulfill({ status: 503, json: { fallback: "film", reason: "unavailable", message: "The live demo did not answer this time. Try again." } }),
  );
  await page.goto("/live");
  await inputTab(page, "Paste").click();
  await transcriptBox(page).fill(rosaCall);
  await turnIntoProposal(page).click();
  await expect(page.getByRole("alert").filter({ hasText: "Try again" })).toBeVisible();

  await page.unroute("**/api/outputs");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expectAllOutputs(page);
});
