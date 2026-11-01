import type { CheckIssue, CheckResult, IssueKind } from "./check-result";
import type { DocumentRequest, RequestItem } from "./document-request";

/**
 * The checks code can do better than a model: compare the year, the name and the signature with
 * the request. Each adds its issue only when the model did not report that kind already, and the
 * status always follows the issues, whatever the model said.
 */

const sameName = (a: string, b: string) => normalise(a) === normalise(b);

function normalise(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function missedIssues(result: CheckResult, item: RequestItem, request: DocumentRequest): CheckIssue[] {
  const found: CheckIssue[] = [];
  if (result.year !== null && result.year !== request.taxYear) {
    found.push({ kind: "wrong_year", detail: `Covers ${result.year}. The ${request.taxYear} version is needed.` });
  }
  if (result.person !== null && !sameName(result.person, request.client.name)) {
    found.push({ kind: "wrong_person", detail: `This is for ${result.person}. ${request.client.name}'s is needed.` });
  }
  if (item.needsSignature && result.signed === false) {
    found.push({ kind: "missing_signature", detail: "The signature is missing." });
  }
  if (!result.matchesRequest) {
    found.push({ kind: "wrong_document", detail: `This is a ${result.documentType}, not a ${item.label}.` });
  }
  return found;
}

export function applyCheckRules(result: CheckResult, item: RequestItem, request: DocumentRequest): CheckResult {
  const reported = new Set<IssueKind>(result.issues.map((issue) => issue.kind));
  const added = missedIssues(result, item, request).filter((issue) => !reported.has(issue.kind));
  const issues = [...result.issues, ...added];
  return { ...result, issues, status: issues.length > 0 ? "problem" : "ok" };
}
