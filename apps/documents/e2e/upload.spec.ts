import { expect, test } from "./support/documents-test";
import { showLane } from "./support/lanes";
import { expectDriveFile, expectFirmState, expectUploadState, openLive, openUploadPage, uploadFile, useSample } from "./support/live-page";
import { fixturePath, samples } from "./support/samples";

test("a sample payslip is checked, filed and ticked off for the firm @documents.upload", async ({ page }) => {
  await openLive(page);
  await expect(page.getByRole("note").filter({ hasText: "Demo answers. No API key is set." })).toBeVisible();

  await openUploadPage(page);
  await useSample(page, samples.payslip);

  await expectUploadState(page, "payslip-summary", "Checked");
  const system = await showLane(page, "system");
  await expect(system).toContainText("Gross pay");
  await expectDriveFile(page, "02 Income", "2025_Okafor-Daniel_Payslip-summary.pdf");
  await expectFirmState(page, "payslip-summary", "Checked");
});

const passingUploads = [samples.bank2025, samples.donation, samples.homeOfficeSigned, samples.healthInsurance];

for (const sample of passingUploads) {
  test(`${sample.fileName} uploaded from disk ends Checked @documents.upload`, async ({ page }) => {
    await openUploadPage(page);
    await uploadFile(page, sample.itemId, fixturePath(sample.fileName));
    await expectUploadState(page, sample.itemId, "Checked");
    await expectFirmState(page, sample.itemId, "Checked");
  });
}
