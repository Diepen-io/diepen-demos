import type { ItemState, RequestItem } from "./document-request";

/**
 * The state of one requested item. An upload is received, then checked or found to have a
 * problem; the engagement letter is checked the moment it is signed. Checked is final.
 */

export type ItemEvent = "uploaded" | "signed" | "checkPassed" | "checkFailed" | "checkAborted";

/** `ignored`: the item is already checked. `invalid`: the event does not fit this item or state. */
export type TransitionOutcome = "applied" | "ignored" | "invalid";

export type Transition = { item: RequestItem; outcome: TransitionOutcome };

function applied(item: RequestItem, state: ItemState, stateBeforeUpload = item.stateBeforeUpload): Transition {
  return { item: { ...item, state, stateBeforeUpload }, outcome: "applied" };
}

export function transition(item: RequestItem, event: ItemEvent): Transition {
  if (item.state === "checked") return { item, outcome: "ignored" };
  const invalid: Transition = { item, outcome: "invalid" };

  switch (event) {
    case "signed":
      return item.kind === "signature" && item.state === "missing" ? applied(item, "checked") : invalid;
    case "uploaded":
      if (item.kind !== "upload") return invalid;
      return item.state === "missing" || item.state === "problem" ? applied(item, "received", item.state) : invalid;
    case "checkPassed":
      return item.state === "received" ? applied(item, "checked", undefined) : invalid;
    case "checkFailed":
      return item.state === "received" ? applied(item, "problem", undefined) : invalid;
    case "checkAborted":
      return item.state === "received" ? applied(item, item.stateBeforeUpload ?? "missing", undefined) : invalid;
  }
}

type Stated = { state: ItemState };

/** Items the client still has to send or send again, in checklist order. */
export function outstanding<T extends Stated>(items: readonly T[]): T[] {
  return items.filter((item) => item.state === "missing" || item.state === "problem");
}

export type Progress = Record<ItemState, number> & { total: number };

export function progress(items: readonly Stated[]): Progress {
  const counts: Progress = { missing: 0, received: 0, checked: 0, problem: 0, total: items.length };
  for (const item of items) counts[item.state] += 1;
  return counts;
}

export function isComplete(items: readonly Stated[]): boolean {
  return items.length > 0 && items.every((item) => item.state === "checked");
}
