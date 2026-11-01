import { describe, expect, it } from "vitest";
import { checkResultSchema } from "./check-result";
import { applyCheckRules } from "./check-rules";
import { createTaxReturnRequest } from "./document-request";
import { sampleDocuments } from "./sample-documents";

const request = createTaxReturnRequest("2026-03-09T09:00");

describe("sample documents @documents.upload", () => {
  it("holds the 9 samples of the plan, each under an upload item", () => {
    expect(sampleDocuments.map((sample) => [sample.fileName, sample.itemId])).toEqual([
      ["payslip-summary-2025.pdf", "payslip-summary"],
      ["payslip-summary-2025-page-1-only.pdf", "payslip-summary"],
      ["payslip-summary-2025-amara-okafor.pdf", "payslip-summary"],
      ["bank-interest-statement-2024.pdf", "bank-interest"],
      ["bank-interest-statement-2025.pdf", "bank-interest"],
      ["donation-receipt-2025.pdf", "donation-receipt"],
      ["home-office-confirmation-2025-unsigned.pdf", "home-office"],
      ["home-office-confirmation-2025-signed.pdf", "home-office"],
      ["health-insurance-statement-2025.png", "health-insurance"],
    ]);
    for (const sample of sampleDocuments) expect(sample.menuLabel.trim()).not.toBe("");
  });

  it("gives every recorded result that parses, matches the request and keeps its status after the rules", () => {
    for (const sample of sampleDocuments) {
      const parsed = checkResultSchema.parse(sample.result);
      expect(parsed.matchesRequest, sample.fileName).toBe(true);
      const item = request.items.find((candidate) => candidate.id === sample.itemId);
      if (!item) throw new Error(`No item ${sample.itemId}`);
      const checked = applyCheckRules(parsed, item, request);
      expect(checked.status, sample.fileName).toBe(parsed.status);
      expect(checked.issues, sample.fileName).toEqual(parsed.issues);
    }
  });

  it("records the issue kind of each problem sample", () => {
    const firstIssue = Object.fromEntries(sampleDocuments.map((sample) => [sample.fileName, sample.result.issues[0]?.kind ?? null]));
    expect(firstIssue).toEqual({
      "payslip-summary-2025.pdf": null,
      "payslip-summary-2025-page-1-only.pdf": "missing_page",
      "payslip-summary-2025-amara-okafor.pdf": "wrong_person",
      "bank-interest-statement-2024.pdf": "wrong_year",
      "bank-interest-statement-2025.pdf": null,
      "donation-receipt-2025.pdf": null,
      "home-office-confirmation-2025-unsigned.pdf": "missing_signature",
      "home-office-confirmation-2025-signed.pdf": null,
      "health-insurance-statement-2025.png": null,
    });
  });
});
