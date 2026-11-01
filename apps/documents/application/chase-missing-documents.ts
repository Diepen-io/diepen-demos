import { escalationTask, followUpEmail, reminderEmail, type OutstandingEntry } from "@/domain/chase-emails";
import { outstanding } from "@/domain/checklist";
import { clientReason } from "@/domain/client-reasons";
import { requestItem } from "@/domain/document-request";
import type { ChaseKind, LiveSession } from "@/domain/live-session";
import { nextChase } from "@/domain/reminder-schedule";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { ChaseJob, JobScheduler } from "./ports/job-scheduler";

export type ChaseEvent = "submitted" | "skip-days";

export type SentChase = {
  id: string;
  kind: ChaseKind;
  to: "client" | "firm";
  sentAt: string;
  subject: string;
  body: string;
  outstanding: OutstandingEntry[];
};

type SchedulerPort = { scheduler: JobScheduler };

/** One pending chase per request: scheduling the next one replaces it. */
const jobIdFor = (session: LiveSession) => `${session.requestId}-next-chase`;

async function scheduleNext(session: LiveSession, { scheduler }: SchedulerPort): Promise<void> {
  const next = nextChase(session);
  if (next) await scheduler.schedule({ id: jobIdFor(session), requestId: session.requestId, runAt: next.dueAt });
  else await scheduler.cancel(jobIdFor(session));
}

/** Records "Done for now" and schedules the chase that is due next. */
export async function chaseMissingDocuments(
  input: { session: LiveSession; profile: CompanyProfile; event: ChaseEvent; now: string },
  ports: SchedulerPort,
): Promise<LiveSession> {
  const { session, event, now } = input;
  const submitted = event === "submitted" && !session.submittedAt;
  const updated: LiveSession = { ...session, now, ...(submitted ? { submittedAt: now } : {}) };
  await scheduleNext(updated, ports);
  return updated;
}

function outstandingAtSendTime(session: LiveSession): OutstandingEntry[] {
  return outstanding(session.items).map((state) => ({ itemId: state.id, reason: clientReason(requestItem(state.id), state) }));
}

const composers = { "follow-up": followUpEmail, reminder: reminderEmail, escalation: escalationTask } as const;

/**
 * The job handler: composes whatever chase is due with the items outstanding right now, adds it
 * to the session and schedules the next one, or cancels when nothing is left to chase.
 */
export async function sendDueChase(
  job: ChaseJob,
  session: LiveSession,
  profile: CompanyProfile,
  ports: SchedulerPort,
): Promise<{ session: LiveSession; sent: SentChase | null }> {
  const due = nextChase(session);
  if (!due) {
    await scheduleNext(session, ports);
    return { session, sent: null };
  }
  const entries = outstandingAtSendTime(session);
  const message = composers[due.kind](profile, entries);
  const id = `chase-${session.chases.length + 1}`;
  const sent: SentChase = {
    id,
    kind: due.kind,
    to: due.kind === "escalation" ? "firm" : "client",
    sentAt: job.runAt,
    ...message,
    outstanding: entries,
  };
  const updated: LiveSession = {
    ...session,
    chases: [...session.chases, { id, kind: due.kind, sentAt: job.runAt }],
    escalated: session.escalated || due.kind === "escalation",
  };
  await scheduleNext(updated, ports);
  return { session: updated, sent };
}
