import { isComplete } from "./checklist";
import type { ChaseKind, LiveSession } from "./live-session";
import { addDays } from "./story-time";

/**
 * When the client hears from the firm again. The follow-up goes out when the client is done for
 * now, or three days after the request; the reminder three days later; then the firm gets a task.
 */

export const chaseIntervalDays = 3;

export type NextChase = { kind: ChaseKind; dueAt: string };

type ScheduleFacts = Pick<LiveSession, "sentAt" | "submittedAt" | "items" | "chases" | "escalated">;

export function nextChase(session: ScheduleFacts): NextChase | null {
  if (session.escalated || isComplete(session.items)) return null;
  const last = session.chases.at(-1);
  switch (session.chases.length) {
    case 0:
      return { kind: "follow-up", dueAt: session.submittedAt ?? addDays(session.sentAt, chaseIntervalDays) };
    case 1:
      return last ? { kind: "reminder", dueAt: addDays(last.sentAt, chaseIntervalDays) } : null;
    case 2:
      return last ? { kind: "escalation", dueAt: addDays(last.sentAt, chaseIntervalDays) } : null;
    default:
      return null;
  }
}
