import { expectAllOutputs, inputTab, output, outputKinds, transcriptBox, turnIntoProposal, watchOutputOrder } from "./support/live";
import { expect, test } from "./support/test";

// F5
test("turns the sample call into six outputs in sequence @meetings.live-sample", async ({ page }) => {
  await page.goto("/live");
  await expect(page.getByText("Demo answers. No API key is set.")).toBeVisible();

  await inputTab(page, "Sample call").click();
  await expect(transcriptBox(page)).toHaveValue(/Tom Becker:/);
  const outputOrder = await watchOutputOrder(page);
  await turnIntoProposal(page).click();
  await expectAllOutputs(page);

  expect(await outputOrder()).toEqual([...outputKinds]);
  await expect(output(page, "crm")).toContainText("Tom Becker");
  await expect(output(page, "proposal")).toContainText("EUR 34 per unit per month");
});
