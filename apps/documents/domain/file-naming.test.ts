import { describe, expect, it } from "vitest";
import type { CheckResult } from "./check-result";
import { createTaxReturnRequest, type RequestItem } from "./document-request";
import { fileNameFor } from "./file-naming";

const request = createTaxReturnRequest("2026-03-09T09:00");

function item(id: string): RequestItem {
  const found = request.items.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No item ${id}`);
  return found;
}

function result(overrides: Partial<CheckResult> = {}): CheckResult {
  return {
    documentType: "Annual payslip summary",
    matchesRequest: true,
    person: "Daniel Okafor",
    year: 2025,
    issues: [],
    keyFigures: [],
    summary: "",
    status: "ok",
    ...overrides,
  };
}

const wrongYear = result({
  year: 2024,
  issues: [{ kind: "wrong_year", detail: "Covers 1 Jan to 31 Dec 2024. The 2025 statement is needed." }],
  status: "problem",
});

describe("fileNameFor @documents.upload", () => {
  it("names a passing file by year, person and file label", () => {
    expect(fileNameFor(item("payslip-summary"), result(), "pdf")).toBe("2025_Okafor-Daniel_Payslip-summary.pdf");
  });

  it("adds the first issue kind with hyphens to a problem file", () => {
    expect(fileNameFor(item("bank-interest"), wrongYear, "pdf")).toBe(
      "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf",
    );
    const twoIssues = result({
      issues: [
        { kind: "missing_signature", detail: "The signature is missing." },
        { kind: "missing_page", detail: "A page is missing." },
      ],
      status: "problem",
    });
    expect(fileNameFor(item("home-office"), twoIssues, "pdf")).toBe(
      "2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf",
    );
  });

  it("keeps the extension of an image", () => {
    expect(fileNameFor(item("health-insurance"), result(), "png")).toBe("2025_Okafor-Daniel_Health-insurance-statement.png");
  });

  it("writes no-year and Unknown for a null year and person", () => {
    const name = fileNameFor(item("payslip-summary"), result({ year: null, person: null }), "pdf");
    expect(name).toBe("no-year_Unknown_Payslip-summary.pdf");
  });

  it("transliterates accents and drops other characters, so the name is ASCII", () => {
    const name = fileNameFor(item("donation-receipt"), result({ person: "Zoë Müller" }), "pdf");
    expect(name).toBe("2025_Muller-Zoe_Donation-receipt.pdf");
    const symbols = fileNameFor(item("donation-receipt"), result({ person: "Siobhán O'Brien" }), "pdf");
    expect(symbols).toBe("2025_OBrien-Siobhan_Donation-receipt.pdf");
  });

  it("stays ASCII without spaces and at most 80 characters before the extension", () => {
    const long = result({ person: "Maximiliana Konstantinopoulou-Wolfeschlegelsteinhausenbergerdorff Ångström" });
    const name = fileNameFor(item("health-insurance"), long, "png");
    expect(name).toMatch(/^[\x21-\x7e]+\.png$/);
    expect(name.slice(0, -".png".length).length).toBeLessThanOrEqual(80);
    expect(name.startsWith("2025_")).toBe(true);
  });
});
