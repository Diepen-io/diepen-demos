import { rgb } from "pdf-lib";
import { addressBlock, addSamplePage, createSamplePdf, grey, margin, rows, savePdf, text, type Letterhead } from "./sample-page.ts";

/** The employer's annual payslip summary: gross pay on page 1, deductions on page 2. */

export type PayslipVariant = {
  person: string;
  taxId: string;
  employeeNumber: string;
  gross: string;
  incomeTax: string;
  social: string;
  net: string;
  /** Salary parts that add up to the gross pay. */
  breakdown: readonly (readonly [string, string])[];
  /** Page 1 still says "of 2" when page 2 is left out. */
  pagesIncluded: 1 | 2;
};

const employer: Letterhead = {
  issuer: "Bramble Freight Ltd",
  lines: ["Payroll department, 2 Depot Road, 00000 Exampletown", "A fictional company"],
  accent: rgb(0.13, 0.36, 0.3),
};

export async function payslipSummary(variant: PayslipVariant): Promise<Uint8Array> {
  const { pdf, fonts } = await createSamplePdf(`Annual payslip summary 2025, ${variant.person}`);

  const first = addSamplePage(pdf, fonts, employer, 1, 2);
  let y = addressBlock(first, fonts, variant.person, ["14 Sample Street", "00000 Exampletown"]);
  text(first, fonts, "Annual payslip summary 2025", margin, y, { size: 20, bold: true });
  text(first, fonts, "Pay period 1 Jan 2025 to 31 Dec 2025", margin, y - 22, { color: grey });
  y = rows(first, fonts, [
    ["Employee", variant.person],
    ["Tax id", variant.taxId],
    ["Employee number", variant.employeeNumber],
  ], y - 60);
  text(first, fonts, "Gross pay 2025", margin, y - 10, { size: 13, bold: true });
  rows(first, fonts, [...variant.breakdown, ["Gross pay 2025", variant.gross]], y - 40, true);
  text(first, fonts, "Deductions and net pay are on page 2.", margin, y - 180, { color: grey });

  if (variant.pagesIncluded === 2) {
    const second = addSamplePage(pdf, fonts, employer, 2, 2);
    text(second, fonts, "Deductions 2025", margin, 700, { size: 20, bold: true });
    text(second, fonts, `${variant.person}, ${variant.taxId}`, margin, 678, { color: grey });
    rows(second, fonts, [
      ["Gross pay 2025", variant.gross],
      ["Income tax withheld", variant.incomeTax],
      ["Social contributions", variant.social],
      ["Net pay 2025", variant.net],
    ], 620, true);
    text(second, fonts, "Issued by Bramble Freight Ltd payroll on 12 Jan 2026.", margin, 470, { color: grey });
  }
  return savePdf(pdf);
}
