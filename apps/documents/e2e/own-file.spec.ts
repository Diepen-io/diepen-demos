import { expect, test } from "./support/documents-test";
import { showLane } from "./support/lanes";
import { expectUploadState, openUploadPage, recordApiRequests, uploadFile } from "./support/live-page";
import { pdfBytes } from "./support/samples";

test("an own PDF gets the generic demo answer @documents.own-file", async ({ page }) => {
  await openUploadPage(page);
  await uploadFile(page, "payslip-summary", { name: "my-file.pdf", mimeType: "application/pdf", buffer: pdfBytes() });

  await expectUploadState(page, "payslip-summary", "Problem found");
  const system = await showLane(page, "system");
  await expect(system).toContainText("Demo answers only cover the sample files.");
});

test("a file over 4 MB is refused in the browser @documents.own-file", async ({ page }) => {
  await openUploadPage(page);
  const checks = recordApiRequests(page, "/api/check");
  await uploadFile(page, "payslip-summary", { name: "big-scan.pdf", mimeType: "application/pdf", buffer: pdfBytes(4_000_001) });

  const client = await showLane(page, "client");
  await expect(client.getByText("Files up to 4 MB.", { exact: true })).toBeVisible();
  await page.waitForTimeout(500);
  expect(checks).toEqual([]);
});

test("a text file is refused in the browser @documents.own-file", async ({ page }) => {
  await openUploadPage(page);
  const checks = recordApiRequests(page, "/api/check");
  await uploadFile(page, "donation-receipt", {
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Donation of EUR 250.00 to Elm Street Food Bank.\n"),
  });

  const client = await showLane(page, "client");
  await expect(client.getByText("Use a PDF, PNG or JPEG.", { exact: true })).toBeVisible();
  await page.waitForTimeout(500);
  expect(checks).toEqual([]);
});
