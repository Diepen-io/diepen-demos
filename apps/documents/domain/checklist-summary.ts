import type { CheckResult, IssueKind } from "./check-result";
import { progress } from "./checklist";
import { requestItem, type ItemId, type ItemState } from "./document-request";

/**
 * What the firm reads instead of opening every file: one headline, one short note per problem
 * and the key figures of the checked documents.
 */

type SummaryItem = { id: ItemId; state: ItemState };

export type ChecklistSummary = {
  headline: string;
  problems: { itemId: ItemId; label: string; note: string }[];
  figures: { label: string; value: string }[];
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const notes: Record<IssueKind, (result: CheckResult) => string> = {
  wrong_year: (result) => (result.year === null ? "Wrong year sent" : `${result.year} version sent`),
  wrong_person: (result) => (result.person === null ? "Sent for someone else" : `Sent for ${result.person}`),
  missing_signature: () => "Signature missing",
  missing_page: () => "A page is missing",
  wrong_document: () => "Different document sent",
  unreadable: () => "Part cannot be read",
  other: () => "Needs a new copy",
};

/** The short line under a problem row in the firm's checklist. */
export function firmNote(result: CheckResult | undefined): string | undefined {
  const issue = result?.issues[0];
  return result && issue ? notes[issue.kind](result) : undefined;
}

export function checklistSummary(
  items: readonly SummaryItem[],
  results: Partial<Record<ItemId, CheckResult>>,
): ChecklistSummary {
  const counts = progress(items);
  const open = [
    counts.problem > 0 && plural(counts.problem, "problem"),
    counts.missing > 0 && `${counts.missing} missing`,
    counts.received > 0 && `${counts.received} being checked`,
  ].filter(Boolean);
  const headline = `${counts.checked} of ${counts.total} checked.${open.length ? ` ${open.join(", ")}.` : ""}`;

  const problems = items
    .filter((item) => item.state === "problem")
    .map((item) => ({ itemId: item.id, label: requestItem(item.id).label, note: firmNote(results[item.id]) ?? "Needs a new copy" }));

  const figures = items.flatMap((item) => {
    const figure = item.state === "checked" ? results[item.id]?.keyFigures[0] : undefined;
    return figure ? [figure] : [];
  });
  return { headline, problems, figures };
}
