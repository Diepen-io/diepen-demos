import { expectAllOutputs, inputTab, output, rosaCall, transcriptBox, turnIntoProposal } from "./support/live";
import { fakeSpeechSays, installFakeSpeech, removeSpeechRecognition } from "./support/speech";
import { expect, test } from "./support/test";

// F8
test("explains that recording needs another browser, and paste still works @meetings.live-record", async ({ page }) => {
  await removeSpeechRecognition(page);
  await page.goto("/live");
  await inputTab(page, "Record").click();
  await expect(page.getByText("Recording needs Chrome, Edge or Safari", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toHaveCount(0);

  await inputTab(page, "Paste").click();
  await transcriptBox(page).fill(rosaCall);
  await turnIntoProposal(page).click();
  await expectAllOutputs(page);
  await expect(output(page, "crm")).toContainText("Rosa Lindqvist");
});

// F9
test("says the microphone is blocked and offers Try again @meetings.live-record", async ({ page }) => {
  await installFakeSpeech(page, "denied");
  await page.goto("/live");
  await inputTab(page, "Record").click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByText("The microphone is blocked.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
});

// F10. The preset's owner is Jonas Albers, so the seller side of the toggle reads "Jonas".
test("records two speakers into the transcript and turns them into six outputs @meetings.live-record", async ({ page }) => {
  await installFakeSpeech(page, "manual");
  await page.goto("/live");
  await inputTab(page, "Record").click();
  await page.getByRole("button", { name: "Start", exact: true }).click();

  await fakeSpeechSays(page, "Hi Rosa, thanks for taking the call. Tell me how you run your flats today.");
  await page.getByRole("radio", { name: "Prospect" }).or(page.getByRole("button", { name: "Prospect", exact: true })).click();
  await fakeSpeechSays(page, "We own 12 flats and spend about 40 hours a month chasing late rent and repairs.");
  await page.getByRole("button", { name: "Stop", exact: true }).click();

  const lines = (await transcriptBox(page).inputValue()).split("\n").filter((line) => line.trim() !== "");
  expect(lines).toHaveLength(2);
  expect(lines[0]).toMatch(/^\[\d{2}:\d{2}\] Jonas: Hi Rosa/);
  expect(lines[1]).toMatch(/^\[\d{2}:\d{2}\] Prospect: We own 12 flats/);

  await turnIntoProposal(page).click();
  await expectAllOutputs(page);
});
