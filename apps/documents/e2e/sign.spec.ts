import { expect, test } from "./support/documents-test";
import { expectDriveFile, expectFirmState, openLetter, openUploadPage, recordApiRequests, signButton } from "./support/live-page";

test("a mouse stroke enables Sign, and signing files the letter without a server call @documents.sign", async ({ page }) => {
  await openUploadPage(page);
  const apiCalls = recordApiRequests(page);
  const client = await openLetter(page);

  await expect(signButton(client)).toBeDisabled();
  const pad = client.getByLabel("Sign here");
  const box = await pad.boundingBox();
  if (!box) throw new Error("The signature pad has no box");
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.3, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 8 });
  await page.mouse.up();
  await expect(signButton(client)).toBeEnabled();

  await signButton(client).click();
  await expectFirmState(page, "engagement-letter", "Checked");
  await expectDriveFile(page, "01 Engagement", "2025_Okafor-Daniel_Engagement-letter_signed.pdf");
  expect(apiCalls).toEqual([]);
});

test("a typed name enables Sign @documents.sign", async ({ page }) => {
  await openUploadPage(page);
  const client = await openLetter(page);

  await expect(signButton(client)).toBeDisabled();
  await client.getByRole("button", { name: "Type your name instead" }).click();
  await expect(signButton(client)).toBeDisabled();
  await client.getByRole("textbox", { name: /name/i }).fill("Daniel Okafor");
  await expect(signButton(client)).toBeEnabled();

  await signButton(client).click();
  await expectFirmState(page, "engagement-letter", "Checked");
});
