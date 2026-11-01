import type { IssueKind } from "./check-result";
import type { RequestItem } from "./document-request";
import type { SessionItem } from "./live-session";

/**
 * The one line per outstanding item that the client reads, in emails and on the upload page.
 * It says what to do, never what the model thought; the first issue wins.
 */

type ReasonFacts = Pick<SessionItem, "detectedYear" | "detectedPerson">;

const reasons: Record<IssueKind, (facts: ReasonFacts) => string> = {
  wrong_year: ({ detectedYear }) =>
    detectedYear === null ? "You sent the one for another year." : `You sent the one for ${detectedYear}.`,
  wrong_person: ({ detectedPerson }) =>
    detectedPerson === null ? "The file you sent is for someone else." : `The file you sent is for ${detectedPerson}.`,
  missing_signature: () => "The signature is missing.",
  missing_page: () => "A page is missing.",
  wrong_document: () => "The file you sent is a different document.",
  unreadable: () => "Part of it cannot be read. A sharper scan or photo helps.",
  other: () => "We need a new copy.",
};

export function clientReason(item: RequestItem, state: Pick<SessionItem, "state" | "issues"> & ReasonFacts): string {
  const [first] = state.issues;
  if (state.state === "problem" && first) return reasons[first.kind](state);
  if (state.state === "received") return "We are checking it.";
  if (state.state === "checked") return "Checked.";
  return item.kind === "signature" ? "Not signed yet." : "Not received yet.";
}
