import { describe, expect, it } from "vitest";
import { isComplete, outstanding, transition, type ItemEvent } from "./checklist";
import { createTaxReturnRequest, type RequestItem } from "./document-request";

const request = createTaxReturnRequest("2026-03-09T09:00");

function item(id: string): RequestItem {
  const found = request.items.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No item ${id}`);
  return found;
}

/** Applies events in order and returns the last transition. */
function run(start: RequestItem, ...events: ItemEvent[]) {
  let current = transition(start, events[0] ?? "uploaded");
  for (const event of events.slice(1)) current = transition(current.item, event);
  return current;
}

const upload = item("payslip-summary");
const signature = item("engagement-letter");

describe("the tax return request @documents.upload", () => {
  it("asks for the 6 items in checklist order, all missing", () => {
    expect(request.items.map((entry) => entry.id)).toEqual([
      "engagement-letter",
      "payslip-summary",
      "bank-interest",
      "donation-receipt",
      "home-office",
      "health-insurance",
    ]);
    expect(request.items.every((entry) => entry.state === "missing")).toBe(true);
  });
});

describe("transition @documents.upload", () => {
  it("moves an upload item from missing to received on uploaded", () => {
    expect(run(upload, "uploaded")).toMatchObject({ item: { state: "received" }, outcome: "applied" });
  });

  it("moves a signature item from missing to checked on signed", () => {
    expect(run(signature, "signed")).toMatchObject({ item: { state: "checked" }, outcome: "applied" });
  });

  it("moves received to checked on checkPassed and to problem on checkFailed", () => {
    expect(run(upload, "uploaded", "checkPassed").item.state).toBe("checked");
    expect(run(upload, "uploaded", "checkFailed").item.state).toBe("problem");
  });

  it("returns to missing when the first check aborts", () => {
    expect(run(upload, "uploaded", "checkAborted")).toMatchObject({ item: { state: "missing" }, outcome: "applied" });
  });

  it("moves problem to received on a new upload, and back to problem when that check aborts", () => {
    const again = run(upload, "uploaded", "checkFailed", "uploaded");
    expect(again.item.state).toBe("received");
    expect(transition(again.item, "checkAborted").item.state).toBe("problem");
  });

  it("ignores every event once an item is checked", () => {
    const checked = run(upload, "uploaded", "checkPassed").item;
    const events: ItemEvent[] = ["uploaded", "signed", "checkPassed", "checkFailed", "checkAborted"];
    for (const event of events) {
      expect(transition(checked, event)).toMatchObject({ item: { state: "checked" }, outcome: "ignored" });
    }
    const signed = run(signature, "signed").item;
    expect(transition(signed, "signed")).toMatchObject({ item: { state: "checked" }, outcome: "ignored" });
  });

  it("reports signed on an upload item as invalid and leaves it unchanged", () => {
    expect(transition(upload, "signed")).toMatchObject({ item: { state: "missing" }, outcome: "invalid" });
    const received = run(upload, "uploaded").item;
    expect(transition(received, "signed")).toMatchObject({ item: { state: "received" }, outcome: "invalid" });
  });

  it("reports uploaded on a signature item as invalid and leaves it unchanged", () => {
    expect(transition(signature, "uploaded")).toMatchObject({ item: { state: "missing" }, outcome: "invalid" });
  });
});

describe("outstanding and isComplete @documents.upload", () => {
  it("returns missing and problem items in checklist order", () => {
    const items = request.items.map((entry) => {
      if (entry.id === "home-office") return run(entry, "uploaded", "checkFailed").item;
      if (entry.id === "payslip-summary") return run(entry, "uploaded", "checkPassed").item;
      if (entry.id === "donation-receipt") return run(entry, "uploaded").item;
      if (entry.id === "engagement-letter") return run(entry, "signed").item;
      return entry;
    });
    expect(outstanding(items).map((entry) => entry.id)).toEqual(["bank-interest", "home-office", "health-insurance"]);
  });

  it("is complete only when all 6 items are checked", () => {
    const checked = request.items.map((entry) =>
      entry.kind === "signature" ? run(entry, "signed").item : run(entry, "uploaded", "checkPassed").item,
    );
    expect(isComplete(checked)).toBe(true);
    expect(isComplete(request.items)).toBe(false);
    const oneReceived = checked.map((entry) => (entry.id === "health-insurance" ? run(item("health-insurance"), "uploaded").item : entry));
    expect(isComplete(oneReceived)).toBe(false);
  });
});
