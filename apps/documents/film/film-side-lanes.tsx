"use client";

import { checklistSummary, firmNote } from "@/domain/checklist-summary";
import { formatStoryTime } from "@/domain/story-time";
import { CheckCard, type CheckPhase } from "@/ui/check-card";
import { DriveLane } from "@/ui/drive-lane";
import { FirmLane } from "@/ui/firm-lane";
import { ScheduleCard } from "@/ui/schedule-card";
import { SystemIdle } from "@/ui/system-idle";
import { memo } from "react";
import type { FilmState } from "./film-state";
import { resultOf, resultsByItem } from "./film-views";

/**
 * The firm, system and Drive lanes of the film, each drawn from the folded film state. The firm and
 * Drive lanes take only values that change when a beat lands, so they skip the per-frame renders.
 */

const freshMs = 700;

type Props = { state: FilmState; t: number; storyTime: number };

/** Ids of the rows that changed less than a moment ago, joined, so the firm lane can stay memoised. */
export function freshRowsAt(state: FilmState, t: number): string {
  return state.checklist.filter((item) => t - (state.rowChangedAt[item.id] ?? -Infinity) < freshMs).map((item) => item.id).join(",");
}

export function freshSummaryAt(state: FilmState, t: number): boolean {
  const at = state.completeAt ?? state.summaryAt;
  return at !== undefined && t - at < freshMs;
}

export const FilmFirmLane = memo(function FilmFirmLane({ state, freshRows, freshSummary }: { state: FilmState; freshRows: string; freshSummary: boolean }) {
  const results = resultsByItem(state);
  const fresh = new Set(freshRows.split(","));
  const rows = state.checklist.map((item) => ({
    id: item.id,
    state: item.state,
    note: item.state === "problem" ? firmNote(results[item.id]) : undefined,
    fresh: fresh.has(item.id),
  }));
  const summary = state.summaryAt === undefined ? undefined : checklistSummary(state.checklist, results);
  return <FirmLane rows={rows} summary={summary} complete={state.completeAt !== undefined} freshSummary={freshSummary} />;
});

function phaseOf(state: FilmState, index: number): CheckPhase {
  const check = state.checks[index];
  if (check?.resultAt !== undefined) return "done";
  const firstWaiting = state.checks.findIndex((entry) => entry.resultAt === undefined);
  return firstWaiting === index ? "reading" : "queued";
}

export function FilmSystemLane({ state, t, storyTime }: Props) {
  const cards = state.checks.map((check, index) => ({
    at: check.arrivedAt,
    node: (
      <CheckCard
        key={check.fileName}
        id={check.fileName}
        fileName={check.fileName}
        phase={phaseOf(state, index)}
        result={check.resultAt === undefined ? undefined : resultOf(check.fileName)}
        compact={check.compact}
        fresh={t - check.arrivedAt < freshMs}
      />
    ),
  }));
  const schedule = state.schedule;
  if (schedule) {
    const from = Date.parse(`${schedule.from}:00Z`);
    const due = Date.parse(`${schedule.dueAt}:00Z`);
    const sent = state.client.emails.some((email) => email.kind === "reminder");
    cards.push({
      at: schedule.at,
      node: (
        <ScheduleCard
          key="schedule"
          title={schedule.title}
          dueLabel={formatStoryTime(schedule.dueAt)}
          progress={sent ? 1 : (storyTime - from) / (due - from)}
          sent={sent}
          fresh={t - schedule.at < freshMs}
        />
      ),
    });
  }
  if (cards.length === 0) return <SystemIdle />;
  return <>{cards.sort((a, b) => a.at - b.at).map((card) => card.node)}</>;
}

type DriveProps = { state: FilmState; freshId: string | undefined; firmName: string; timeAt: (filmMs: number) => string };

export const FilmDriveLane = memo(function FilmDriveLane({ state, freshId, firmName, timeAt }: DriveProps) {
  const filedAt = Object.fromEntries(Object.entries(state.filedAt).map(([id, at]) => [id, timeAt(at)]));
  return <DriveLane firmName={firmName} tree={state.drive} filedAt={filedAt} freshId={freshId} />;
});
