import { describe, expect, it } from "vitest";
import type { CheckResult } from "./check-result";
import { applyCheckRules } from "./check-rules";
import { createTaxReturnRequest, type RequestItem } from "./document-request";

const request = createTaxReturnRequest("2026-03-09T09:00");

function item(id: string): RequestItem {
  const found = request.items.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No item ${id}`);
  return found;
}

const payslip = item("payslip-summary");
const homeOffice = item("home-office");

function result(overrides: Partial<CheckResult> = {}): CheckResult {
  return {
    documentType: "Annual payslip summary",
    matchesRequest: true,
    person: "Daniel Okafor",
    year: 2025,
    pageCount: 2,
    issues: [],
    keyFigures: [{ label: "Gross pay", value: "EUR 58,400.00" }],
    summary: "Annual payslip summary 2025 for Daniel Okafor.",
    status: "ok",
    ...overrides,
  };
}

const kinds = (checked: CheckResult) => checked.issues.map((issue) => issue.kind);

describe("applyCheckRules @documents.problem", () => {
  it("leaves a clean result clean", () => {
    const checked = applyCheckRules(result(), payslip, request);
    expect(checked.issues).toEqual([]);
    expect(checked.status).toBe("ok");
  });

  it("adds wrong_year when the year is not 2025", () => {
    const checked = applyCheckRules(result({ year: 2024 }), payslip, request);
    expect(checked.issues).toEqual([{ kind: "wrong_year", detail: "Covers 2024. The 2025 version is needed." }]);
    expect(checked.status).toBe("problem");
  });

  it("adds wrong_person when the name is someone else's", () => {
    const checked = applyCheckRules(result({ person: "Amara Okafor" }), payslip, request);
    expect(checked.issues).toEqual([{ kind: "wrong_person", detail: "This is for Amara Okafor. Daniel Okafor's is needed." }]);
    expect(checked.status).toBe("problem");
  });

  it("compares the name without case and extra spaces", () => {
    const checked = applyCheckRules(result({ person: "  daniel   OKAFOR " }), payslip, request);
    expect(checked.issues).toEqual([]);
    expect(checked.status).toBe("ok");
  });

  it("adds missing_signature only for an item that needs a signature and only when signed is false", () => {
    expect(kinds(applyCheckRules(result({ signed: false }), homeOffice, request))).toEqual(["missing_signature"]);
    expect(applyCheckRules(result({ signed: false }), homeOffice, request).issues[0]?.detail).toBe("The signature is missing.");
    expect(kinds(applyCheckRules(result({ signed: true }), homeOffice, request))).toEqual([]);
    expect(kinds(applyCheckRules(result({ signed: false }), payslip, request))).toEqual([]);
  });

  it("adds wrong_document when the file does not match the request", () => {
    const checked = applyCheckRules(result({ matchesRequest: false, documentType: "Bank statement" }), payslip, request);
    expect(kinds(checked)).toEqual(["wrong_document"]);
    expect(checked.issues[0]?.detail).toContain("Bank statement");
    expect(checked.issues[0]?.detail).toContain(payslip.label);
    expect(checked.status).toBe("problem");
  });

  it("adds the missed kinds in rule order after the model's own issues", () => {
    const checked = applyCheckRules(
      result({
        year: 2023,
        person: "Amara Okafor",
        signed: false,
        matchesRequest: false,
        issues: [{ kind: "unreadable", detail: "The bottom of page 2 is blurred." }],
      }),
      homeOffice,
      request,
    );
    expect(kinds(checked)).toEqual(["unreadable", "wrong_year", "wrong_person", "missing_signature", "wrong_document"]);
  });

  it("never adds a kind the model already reported", () => {
    const own = { kind: "wrong_year" as const, detail: "This statement covers 2024." };
    const checked = applyCheckRules(result({ year: 2024, issues: [own], status: "problem" }), payslip, request);
    expect(checked.issues).toEqual([own]);

    const signature = { kind: "missing_signature" as const, detail: "The employer signature field on page 1 is empty." };
    const unsigned = applyCheckRules(result({ signed: false, issues: [signature], status: "problem" }), homeOffice, request);
    expect(unsigned.issues).toEqual([signature]);
  });

  it("ignores a null year and a null person", () => {
    const checked = applyCheckRules(result({ year: null, person: null }), payslip, request);
    expect(checked.issues).toEqual([]);
    expect(checked.status).toBe("ok");
  });

  it("sets status from the issues, whatever the model said", () => {
    expect(applyCheckRules(result({ status: "problem" }), payslip, request).status).toBe("ok");
    const withIssue = result({ status: "ok", issues: [{ kind: "missing_page", detail: "Page 2 is missing." }] });
    expect(applyCheckRules(withIssue, payslip, request).status).toBe("problem");
  });
});
