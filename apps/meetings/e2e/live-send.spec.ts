import { output, runSampleCall } from "./support/live";
import { expect, test } from "./support/test";

// A flow waits for a dev compile, then up to 30 s per output (`outputTimeout`) and the 700 ms reveal steps; a loaded machine needs the margin.
test.describe.configure({ timeout: 90_000 });

// F11
test("sends the follow-up email and shows transcript to proposal sent @meetings.live-send", async ({ page }) => {
  await runSampleCall(page);
  await expect(output(page, "email")).toContainText("Simulated email.");
  await page.getByRole("button", { name: "Send to Tom" }).click();

  await expect(output(page, "email")).toContainText(/Sent \d{2}:\d{2}/);
  await expect(output(page, "crm")).toContainText("Proposal sent");
  await expect(output(page, "crm")).toContainText("Proposal sent. Next: Proposal review with Tom Becker on");
  await expect(output(page, "crm")).not.toContainText("Send the proposal today");
  await expect(page.getByText(/Transcript to proposal sent: \d+/)).toBeVisible();
});
