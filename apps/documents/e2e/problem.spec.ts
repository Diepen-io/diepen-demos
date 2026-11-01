import { expect, test } from "./support/documents-test";
import { expectDriveFile, expectUploadState, openUploadPage, uploadFile, uploadRow, useSample } from "./support/live-page";
import { fixturePath, samples, type Sample } from "./support/samples";

type ProblemCase = { problem: Sample; reason: string; problemFile: string; fix: Sample; fixedFolder: string; fixedFile: string };

const cases: ProblemCase[] = [
  {
    problem: samples.payslipPageOne,
    reason: "A page is missing.",
    problemFile: "2025_Okafor-Daniel_Payslip-summary_missing-page.pdf",
    fix: samples.payslip,
    fixedFolder: "02 Income",
    fixedFile: "2025_Okafor-Daniel_Payslip-summary.pdf",
  },
  {
    problem: samples.payslipAmara,
    reason: "The file you sent is for Amara Okafor.",
    problemFile: "2025_Okafor-Amara_Payslip-summary_wrong-person.pdf",
    fix: samples.payslip,
    fixedFolder: "02 Income",
    fixedFile: "2025_Okafor-Daniel_Payslip-summary.pdf",
  },
  {
    problem: samples.bank2024,
    reason: "You sent the one for 2024.",
    problemFile: "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf",
    fix: samples.bank2025,
    fixedFolder: "03 Bank",
    fixedFile: "2025_Okafor-Daniel_Bank-interest-statement.pdf",
  },
  {
    problem: samples.homeOfficeUnsigned,
    reason: "The signature is missing.",
    problemFile: "2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf",
    fix: samples.homeOfficeSigned,
    fixedFolder: "04 Deductions",
    fixedFile: "2025_Okafor-Daniel_Home-office-confirmation.pdf",
  },
];

for (const { problem, reason, problemFile, fix, fixedFolder, fixedFile } of cases) {
  test(`${problem.fileName} shows Problem found, then the right file replaces it @documents.problem`, async ({ page }) => {
    await openUploadPage(page);
    await useSample(page, problem);

    await expectUploadState(page, problem.itemId, "Problem found");
    await expect(uploadRow(page, problem.itemId)).toContainText(reason);
    await expectDriveFile(page, "00 Needs attention", problemFile);

    await uploadFile(page, fix.itemId, fixturePath(fix.fileName), true);
    await expectUploadState(page, fix.itemId, "Checked");
    await expectDriveFile(page, fixedFolder, fixedFile);
    await expectDriveFile(page, "99 Replaced", problemFile);
  });
}
