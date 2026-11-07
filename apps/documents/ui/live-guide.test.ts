import { describe, expect, it } from "vitest";
import { documentsGuide } from "./live-guide";
import { initialLiveState, type LiveState } from "./live-state";

function state(overrides: Partial<LiveState> = {}, session: Partial<LiveState["session"]> = {}): LiveState {
  const start = initialLiveState();
  return { ...start, ...overrides, session: { ...start.session, ...session } };
}

const payslipCheck: LiveState["checks"][number] = { id: "check-1", itemId: "payslip-summary", fileName: "payslip-summary-2025.pdf", phase: "done" };
const sentFile = [payslipCheck];
const chase = (id: string, kind: "follow-up" | "reminder" | "escalation") => ({ id, kind, sentAt: "2026-03-09T12:40" });

describe("the live guide's next step @documents.guide", () => {
  it("walks the first visit: open the email, open the upload page, send a file", () => {
    expect(documentsGuide(state())).toMatchObject({ number: 1, spotlight: "request-email" });
    expect(documentsGuide(state({ screen: "email" }))).toMatchObject({ number: 2, spotlight: "upload-and-sign" });
    expect(documentsGuide(state({ screen: "upload" }))).toMatchObject({ number: 3, spotlight: "use-a-sample" });
  });

  it("waits while a file is read, then points at Done for now", () => {
    expect(documentsGuide(state({ screen: "upload", checks: [{ ...payslipCheck, phase: "reading" }] }))).toMatchObject({ waiting: true });
    expect(documentsGuide(state({ screen: "upload", checks: sentFile }))).toMatchObject({ number: 4, spotlight: "done-for-now" });
    expect(documentsGuide(state({ screen: "inbox", checks: sentFile }))).toMatchObject({ number: 4, action: "show-upload" });
  });

  it("offers Skip 3 days after each chase and ends on the escalation", () => {
    expect(documentsGuide(state({}, { chases: [chase("c1", "follow-up")] }))).toMatchObject({ number: 5, action: "skip" });
    expect(documentsGuide(state({}, { chases: [chase("c1", "follow-up"), chase("c2", "reminder")] }))).toMatchObject({ number: 6, action: "skip" });
    expect(documentsGuide(state({}, { escalated: true }))).toMatchObject({ action: "end" });
    expect(documentsGuide(state({}, { escalated: true })).number).toBeUndefined();
  });

  it("ends when every item is checked and Daniel pressed Done for now", () => {
    const items = initialLiveState().items.map((item) => ({ ...item, state: "checked" as const }));
    expect(documentsGuide(state({ items }, { submittedAt: "2026-03-09T12:45" }))).toMatchObject({ action: "end" });
  });
});
