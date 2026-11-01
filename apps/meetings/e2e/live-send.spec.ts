import { output, runSampleCall } from "./support/live";
import { expect, test } from "./support/test";

// F11
test("sends the follow-up email and shows transcript to proposal sent @meetings.live-send", async ({ page }) => {
  await runSampleCall(page);
  await expect(output(page, "email")).toContainText("Simulated email.");
  await page.getByRole("button", { name: "Send to Tom" }).click();

  await expect(output(page, "email")).toContainText(/Sent \d{2}:\d{2}/);
  await expect(output(page, "crm")).toContainText("Proposal sent");
  await expect(page.getByText(/Transcript to proposal sent: \d+/)).toBeVisible();
});
