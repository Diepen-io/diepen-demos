"use client";

import { isComplete } from "@/domain/checklist";
import { checklistSummary, firmNote } from "@/domain/checklist-summary";
import { newestEntryId } from "@/domain/drive-folder";
import type { ChaseKind } from "@/domain/live-session";
import { nextChase } from "@/domain/reminder-schedule";
import { formatStoryTime, storyTimeToMs } from "@/domain/story-time";
import { CheckCard } from "./check-card";
import { DriveLane } from "./drive-lane";
import { FirmLane } from "./firm-lane";
import { sessionOf, type LiveState } from "./live-state";
import { ScheduleCard } from "./schedule-card";
import { SystemIdle } from "./system-idle";

/** The firm, system and Drive lanes of live mode, drawn from real check results. */

export function LiveFirmLane({ state }: { state: LiveState }) {
  const rows = state.items.map((item) => ({
    id: item.id,
    state: item.state,
    note: item.state === "problem" ? firmNote(state.results[item.id]) : undefined,
  }));
  const anyChecked = state.checks.some((check) => check.phase === "done");
  const summary = anyChecked || isComplete(state.items) ? checklistSummary(state.items, state.results) : undefined;
  return <FirmLane rows={rows} summary={summary} complete={isComplete(state.items)} escalation={state.escalation} />;
}

const nextTitles: Record<ChaseKind, string> = {
  "follow-up": "Follow-up",
  reminder: "Reminder 2",
  escalation: "Call Daniel Okafor",
};

function NextChaseCard({ state }: { state: LiveState }) {
  const session = sessionOf(state);
  const next = nextChase(session);
  if (!next) return null;
  const from = session.chases.at(-1)?.sentAt ?? session.submittedAt ?? session.sentAt;
  const span = storyTimeToMs(next.dueAt) - storyTimeToMs(from);
  const progress = span > 0 ? (storyTimeToMs(state.now) - storyTimeToMs(from)) / span : 1;
  return <ScheduleCard title={nextTitles[next.kind]} dueLabel={formatStoryTime(next.dueAt)} progress={progress} sent={false} />;
}

export function LiveSystemLane({ state }: { state: LiveState }) {
  return (
    <>
      {state.feed.length === 0 && <SystemIdle />}
      {state.feed.map((entry) => {
        if (entry.kind === "check") {
          const check = state.checks.find((candidate) => candidate.id === entry.id);
          return check ? <CheckCard key={check.id} id={check.id} fileName={check.fileName} phase={check.phase} result={check.result} fresh /> : null;
        }
        const chase = state.chasesSent.find((candidate) => candidate.id === entry.id);
        return chase ? <ScheduleCard key={chase.id} title={chase.title} dueLabel={formatStoryTime(chase.sentAt)} progress={1} sent fresh /> : null;
      })}
      <NextChaseCard state={state} />
    </>
  );
}

export function LiveDriveLane({ state, firmName }: { state: LiveState; firmName: string }) {
  return <DriveLane firmName={firmName} tree={state.drive} filedAt={state.filedAt} freshId={newestEntryId(state.drive)} />;
}
