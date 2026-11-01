"use client";

import { escalationTask } from "@/domain/chase-emails";
import { isComplete } from "@/domain/checklist";
import { checklistSummary, firmNote } from "@/domain/checklist-summary";
import { newestEntryId } from "@/domain/drive-folder";
import type { ChaseKind } from "@/domain/live-session";
import { nextChase } from "@/domain/reminder-schedule";
import { formatStoryTime, formatWeekdayTime, storyTimeToMs } from "@/domain/story-time";
import type { CompanyProfile } from "@diepen/voice/profile";
import { CheckCard } from "./check-card";
import { DriveLane } from "./drive-lane";
import { FirmLane } from "./firm-lane";
import { sessionOf, type LiveState, type SentChaseCard } from "./live-state";
import { replacedChecks } from "./replaced-checks";
import { ScheduleCard, sentOnSchedule, type ChaseStatus } from "./schedule-card";
import { SystemIdle } from "./system-idle";

/** The firm, system and Drive lanes of live mode, drawn from real check results and the active profile. */

export function LiveFirmLane({ state, profile }: { state: LiveState; profile: CompanyProfile }) {
  const rows = state.items.map((item) => ({
    id: item.id,
    state: item.state,
    note: item.state === "problem" ? firmNote(state.results[item.id]) : undefined,
  }));
  const anyChecked = state.checks.some((check) => check.phase === "done");
  const summary = anyChecked || isComplete(state.items) ? checklistSummary(state.items, state.results) : undefined;
  const escalation = state.escalation ? escalationTask(profile, state.escalation.outstanding) : undefined;
  return (
    <FirmLane
      rows={rows}
      requestSentAt={formatWeekdayTime(state.session.sentAt)}
      summary={summary}
      complete={isComplete(state.items)}
      escalation={escalation}
    />
  );
}

const chaseTitles: Record<ChaseKind, string> = {
  "follow-up": "Follow-up",
  reminder: "Reminder 2",
  escalation: "Call Daniel Okafor",
};

function sentStatus(chase: SentChaseCard, firmName: string): ChaseStatus {
  if (chase.kind === "escalation") return { kind: "sent", badge: "Task", note: `Added to ${firmName}'s tasks` };
  if (chase.trigger === "done") return { kind: "sent", badge: "Sent", note: "Sent when Daniel pressed Done for now" };
  return sentOnSchedule;
}

function NextChaseCard({ state }: { state: LiveState }) {
  const session = sessionOf(state);
  const next = nextChase(session);
  if (!next) return null;
  const from = session.chases.at(-1)?.sentAt ?? session.submittedAt ?? session.sentAt;
  const span = storyTimeToMs(next.dueAt) - storyTimeToMs(from);
  const progress = span > 0 ? (storyTimeToMs(state.now) - storyTimeToMs(from)) / span : 1;
  return <ScheduleCard title={chaseTitles[next.kind]} dueLabel={formatStoryTime(next.dueAt)} status={{ kind: "scheduled", progress }} />;
}

export function LiveSystemLane({ state, firmName }: { state: LiveState; firmName: string }) {
  const replaced = replacedChecks(
    state.checks,
    (check) => check.itemId,
    (check) => check.phase === "done" && check.result?.status === "ok",
  );
  return (
    <>
      {state.feed.length === 0 && <SystemIdle />}
      {state.feed.map((entry) => {
        if (entry.kind === "check") {
          const check = state.checks.find((candidate) => candidate.id === entry.id);
          return check ? (
            <CheckCard key={check.id} id={check.id} fileName={check.fileName} phase={check.phase} result={check.result} replaced={replaced.has(check)} fresh />
          ) : null;
        }
        const chase = state.chasesSent.find((candidate) => candidate.id === entry.id);
        return chase ? (
          <ScheduleCard key={chase.id} title={chaseTitles[chase.kind]} dueLabel={formatStoryTime(chase.sentAt)} status={sentStatus(chase, firmName)} fresh />
        ) : null;
      })}
      <NextChaseCard state={state} />
    </>
  );
}

export function LiveDriveLane({ state, firmName }: { state: LiveState; firmName: string }) {
  return <DriveLane firmName={firmName} tree={state.drive} filedAt={state.filedAt} freshId={newestEntryId(state.drive)} />;
}
