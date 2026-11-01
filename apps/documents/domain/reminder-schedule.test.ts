import { completeSession, dayMs, filmSession, storyMs } from "@/test-support/live-sessions";
import { describe, expect, it } from "vitest";
import { chaseIntervalDays, nextChase } from "./reminder-schedule";

const followUpSent = "2026-03-09T12:50";
const reminderSent = "2026-03-12T12:50";

function due(session: Parameters<typeof nextChase>[0]) {
  const next = nextChase(session);
  if (!next) throw new Error("Expected a next chase");
  return { kind: next.kind, at: storyMs(next.dueAt) };
}

describe("nextChase @documents.chase", () => {
  it("waits 3 days between chases", () => {
    expect(chaseIntervalDays).toBe(3);
  });

  it("schedules the follow-up 3 days after the request when nothing was submitted", () => {
    const session = filmSession();
    expect(due(session)).toEqual({ kind: "follow-up", at: storyMs(session.sentAt) + 3 * dayMs });
  });

  it("schedules the follow-up at the submit time once the client pressed Done for now", () => {
    const session = filmSession({ submittedAt: "2026-03-09T12:50" });
    expect(due(session)).toEqual({ kind: "follow-up", at: storyMs("2026-03-09T12:50") });
  });

  it("schedules the reminder 3 days after the follow-up", () => {
    const session = filmSession({
      submittedAt: followUpSent,
      chases: [{ id: "chase-1", kind: "follow-up", sentAt: followUpSent }],
    });
    expect(due(session)).toEqual({ kind: "reminder", at: storyMs(followUpSent) + 3 * dayMs });
  });

  it("schedules the escalation to the firm 3 days after the reminder, moved past the weekend to Monday", () => {
    const session = filmSession({
      submittedAt: followUpSent,
      now: reminderSent,
      chases: [
        { id: "chase-1", kind: "follow-up", sentAt: followUpSent },
        { id: "chase-2", kind: "reminder", sentAt: reminderSent },
      ],
    });
    // Thursday 12 March plus 3 days is a Sunday.
    expect(due(session)).toEqual({ kind: "escalation", at: storyMs("2026-03-16T12:50") });
  });

  it("returns null when the request is complete", () => {
    expect(nextChase(completeSession())).toBeNull();
    expect(
      nextChase(completeSession({ chases: [{ id: "chase-1", kind: "follow-up", sentAt: followUpSent }] })),
    ).toBeNull();
  });

  it("returns null once the request was escalated", () => {
    const session = filmSession({
      escalated: true,
      chases: [
        { id: "chase-1", kind: "follow-up", sentAt: followUpSent },
        { id: "chase-2", kind: "reminder", sentAt: reminderSent },
        { id: "chase-3", kind: "escalation", sentAt: "2026-03-15T12:50" },
      ],
    });
    expect(nextChase(session)).toBeNull();
  });
});
