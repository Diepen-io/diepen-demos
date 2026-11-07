import { expectAllOutputs, inputTab, output, rosaCall, runSampleCall, transcriptBox, turnIntoProposal } from "./support/live";
import { expect, test } from "./support/test";

// A flow waits for a dev compile, then up to 30 s per output (`outputTimeout`) and the 700 ms reveal steps; a loaded machine needs the margin.
test.describe.configure({ timeout: 90_000 });

// F18
test("asks before the sample call replaces a typed transcript @meetings.live-sample", async ({ page }) => {
  await page.goto("/live");
  await inputTab(page, "Paste").click();
  await transcriptBox(page).fill(rosaCall);
  await inputTab(page, "Sample call").click();

  await expect(transcriptBox(page)).toHaveValue(rosaCall);
  await page.getByRole("button", { name: "Replace with the sample call" }).click();
  await expect(transcriptBox(page)).toHaveValue(/Tom Becker:/);
});

// F19
test("marks the drafts out of date when the transcript changes, and drafts again @meetings.live-paste", async ({ page }) => {
  await runSampleCall(page);
  await expect(page.getByText("Read 36 turns")).toBeVisible();

  await inputTab(page, "Paste").click();
  await transcriptBox(page).fill(rosaCall);
  await expect(page.getByRole("button", { name: "Draft again" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send to Tom" })).toBeDisabled();

  await page.getByRole("button", { name: "Draft again" }).click();
  await expectAllOutputs(page);
  await expect(output(page, "crm")).toContainText("Rosa Lindqvist");
  await expect(page.getByText("Read 6 turns")).toBeVisible();
  await expect(page.getByRole("button", { name: "Draft again" })).toHaveCount(0);
});

// F20
test("says the transcript is ready after Start over @meetings.live-sample", async ({ page }) => {
  await runSampleCall(page);
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByText("Ready to read 36 turns")).toBeVisible();
  await expect(turnIntoProposal(page)).toBeEnabled();
});
