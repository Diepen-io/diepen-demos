import type { CheckResult } from "./check-result";
import type { UploadItemId } from "./document-request";

/**
 * The nine fake documents in `public/fixtures/` and the check result recorded for each. The
 * keyless mock answers, the sample menu and the fixture generator read this one list. Type imports only, so the
 * generator runs under plain Node.
 */

export type SampleDocument = {
  fileName: string;
  itemId: UploadItemId;
  /** The entry in the "Use a sample" menu: what is in the file, not its name. */
  menuLabel: string;
  result: CheckResult;
};

const daniel = "Daniel Okafor";

export const sampleDocuments: readonly SampleDocument[] = [
  {
    fileName: "payslip-summary-2025.pdf",
    itemId: "payslip-summary",
    menuLabel: "2025 summary, both pages",
    result: {
      documentType: "Annual payslip summary",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 2,
      issues: [],
      keyFigures: [
        { label: "Gross pay", value: "EUR 58,400.00" },
        { label: "Income tax withheld", value: "EUR 9,870.00" },
        { label: "Employer", value: "Bramble Freight Ltd" },
      ],
      summary:
        "Annual payslip summary 2025 from Bramble Freight Ltd for Daniel Okafor. Gross pay EUR 58,400.00, income tax withheld EUR 9,870.00.",
      status: "ok",
    },
  },
  {
    fileName: "payslip-summary-2025-page-1-only.pdf",
    itemId: "payslip-summary",
    menuLabel: "Page 1 of 2 only",
    result: {
      documentType: "Annual payslip summary",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 1,
      issues: [{ kind: "missing_page", detail: "The summary says page 1 of 2. Page 2 with the tax withheld is missing." }],
      keyFigures: [{ label: "Gross pay", value: "EUR 58,400.00" }],
      summary: "Page 1 of the 2025 payslip summary from Bramble Freight Ltd. Page 2 with the income tax withheld is missing.",
      status: "problem",
    },
  },
  {
    fileName: "payslip-summary-2025-amara-okafor.pdf",
    itemId: "payslip-summary",
    menuLabel: "Amara Okafor's summary",
    result: {
      documentType: "Annual payslip summary",
      matchesRequest: true,
      person: "Amara Okafor",
      year: 2025,
      pageCount: 2,
      issues: [{ kind: "wrong_person", detail: "This summary is for Amara Okafor. Daniel Okafor's is needed." }],
      keyFigures: [{ label: "Gross pay", value: "EUR 41,200.00" }],
      summary: "Annual payslip summary 2025 for Amara Okafor, not for Daniel Okafor. Daniel's own summary is still needed.",
      status: "problem",
    },
  },
  {
    fileName: "bank-interest-statement-2024.pdf",
    itemId: "bank-interest",
    menuLabel: "2024 statement",
    result: {
      documentType: "Bank interest statement",
      matchesRequest: true,
      person: daniel,
      year: 2024,
      pageCount: 1,
      issues: [{ kind: "wrong_year", detail: "Covers 1 Jan to 31 Dec 2024. The 2025 statement is needed." }],
      keyFigures: [{ label: "Interest earned", value: "EUR 112.40" }],
      summary: "Interest statement from Sample Savings Bank for 2024. The 2025 statement is still needed.",
      status: "problem",
    },
  },
  {
    fileName: "bank-interest-statement-2025.pdf",
    itemId: "bank-interest",
    menuLabel: "2025 statement",
    result: {
      documentType: "Bank interest statement",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 1,
      issues: [],
      keyFigures: [
        { label: "Interest earned", value: "EUR 138.75" },
        { label: "Tax withheld", value: "EUR 0.00" },
      ],
      summary: "2025 interest statement from Sample Savings Bank. Interest earned EUR 138.75, no tax withheld.",
      status: "ok",
    },
  },
  {
    fileName: "donation-receipt-2025.pdf",
    itemId: "donation-receipt",
    menuLabel: "Food bank receipt",
    result: {
      documentType: "Donation receipt",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 1,
      signed: true,
      issues: [],
      keyFigures: [
        { label: "Donation", value: "EUR 250.00" },
        { label: "Date", value: "14 Dec 2025" },
        { label: "Recipient", value: "Elm Street Food Bank" },
      ],
      summary: "Donation receipt from Elm Street Food Bank: EUR 250.00 on 14 Dec 2025, signed by the charity.",
      status: "ok",
    },
  },
  {
    fileName: "home-office-confirmation-2025-unsigned.pdf",
    itemId: "home-office",
    menuLabel: "Form without the employer's signature",
    result: {
      documentType: "Home office confirmation",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 1,
      signed: false,
      issues: [{ kind: "missing_signature", detail: "The employer signature field on page 1 is empty." }],
      keyFigures: [{ label: "Home office days", value: "96 days" }],
      summary: "Home office confirmation for 2025 with 96 days. The employer has not signed it yet.",
      status: "problem",
    },
  },
  {
    fileName: "home-office-confirmation-2025-signed.pdf",
    itemId: "home-office",
    menuLabel: "Form signed by the employer",
    result: {
      documentType: "Home office confirmation",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 1,
      signed: true,
      issues: [],
      keyFigures: [{ label: "Home office days", value: "96 days" }],
      summary: "Home office confirmation for 2025: 96 days, signed by Priya Shah, HR at Bramble Freight Ltd.",
      status: "ok",
    },
  },
  {
    fileName: "health-insurance-statement-2025.png",
    itemId: "health-insurance",
    menuLabel: "Phone photo of the 2025 statement",
    result: {
      documentType: "Health insurance statement",
      matchesRequest: true,
      person: daniel,
      year: 2025,
      pageCount: 1,
      issues: [],
      keyFigures: [
        { label: "Premiums paid", value: "EUR 2,964.00" },
        { label: "Insurer", value: "Lindgren Health" },
      ],
      summary: "2025 statement from Lindgren Health. Premiums paid EUR 2,964.00.",
      status: "ok",
    },
  },
];

export function sampleNamed(fileName: string): SampleDocument | undefined {
  return sampleDocuments.find((sample) => sample.fileName === fileName);
}
