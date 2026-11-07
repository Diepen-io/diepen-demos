import { expectAllOutputs, inputTab, output, outputKinds, transcriptBox, turnIntoProposal, watchOutputOrder } from "./support/live";
import { expect, test } from "./support/test";

// A flow waits for a dev compile, then up to 30 s per output (`outputTimeout`) and the 700 ms reveal steps; a loaded machine needs the margin.
test.describe.configure({ timeout: 90_000 });

// F5
test("turns the sample call into six outputs in sequence @meetings.live-sample", async ({ page }) => {
  await page.goto("/live");
  await expect(page.getByRole("note").filter({ hasText: /sample answers/i })).toBeVisible();

  await inputTab(page, "Sample call").click();
  await expect(transcriptBox(page)).toHaveValue(/Tom Becker:/);
  const outputOrder = await watchOutputOrder(page);
  await turnIntoProposal(page).click();
  await expectAllOutputs(page);

  expect(await outputOrder()).toEqual([...outputKinds]);
  await expect(output(page, "crm")).toContainText("Tom Becker");
  await expect(output(page, "proposal")).toContainText("EUR 34 per unit per month");
});
