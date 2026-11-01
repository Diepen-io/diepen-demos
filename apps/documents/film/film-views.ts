import type { CheckResult } from "@/domain/check-result";
import { clientReason } from "@/domain/client-reasons";
import { requestItem, type ItemId } from "@/domain/document-request";
import { sampleNamed } from "@/domain/sample-documents";
import type { FilmState } from "./film-state";

/** Lookups the film lanes share: recorded results per file and per item, and the reasons Daniel reads. */

export function resultOf(fileName: string): CheckResult | undefined {
  return sampleNamed(fileName)?.result;
}

/** The latest recorded result per item, among the checks that have a result on screen. */
export function resultsByItem(state: FilmState): Partial<Record<ItemId, CheckResult>> {
  const results: Partial<Record<ItemId, CheckResult>> = {};
  for (const check of state.checks) {
    const sample = sampleNamed(check.fileName);
    if (sample && check.resultAt !== undefined) results[sample.itemId] = sample.result;
  }
  return results;
}

export function reasonFor(itemId: ItemId, state: FilmState, result: CheckResult | undefined): string | undefined {
  const item = state.checklist.find((entry) => entry.id === itemId);
  if (!item || item.state !== "problem" || !result) return undefined;
  return clientReason(requestItem(itemId), {
    state: "problem",
    issues: result.issues,
    detectedYear: result.year,
    detectedPerson: result.person,
  });
}

/** Story time as "12:41". */
export function clockLabel(storyMs: number): string {
  return new Date(storyMs).toISOString().slice(11, 16);
}

/** The items Daniel still owes in the film's follow-up and reminder, with their reasons. */
export function filmOutstanding() {
  const bank = resultOf("bank-interest-statement-2024.pdf");
  const homeOffice = resultOf("home-office-confirmation-2025-unsigned.pdf");
  const reason = (itemId: ItemId, result: CheckResult | undefined) =>
    clientReason(requestItem(itemId), result
      ? { state: "problem", issues: result.issues, detectedYear: result.year, detectedPerson: result.person }
      : { state: "missing", issues: [], detectedYear: null, detectedPerson: null });
  return [
    { itemId: "bank-interest" as const, reason: reason("bank-interest", bank) },
    { itemId: "home-office" as const, reason: reason("home-office", homeOffice) },
    { itemId: "health-insurance" as const, reason: reason("health-insurance", undefined) },
  ];
}
