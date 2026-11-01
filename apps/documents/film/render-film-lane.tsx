"use client";

import { newestEntryId } from "@/domain/drive-folder";
import { formatWeekdayTime, storyTimeFromMs } from "@/domain/story-time";
import type { LaneContext } from "@diepen/ui/film/film-stage";
import { beatsUntil, storyTimeAt, type FilmLane, type FilmScript } from "@diepen/ui/film/film-script";
import { useNarrowScreen } from "@diepen/ui/film/use-stage-environment";
import { cx } from "@diepen/ui/primitives/class-names";
import type { CompanyProfile } from "@diepen/voice/profile";
import { useMemo, type ReactNode } from "react";
import type { DocumentsBeat } from "./documents-beat";
import { clientMomentAt, FilmClientLane } from "./film-client-lane";
import { FilmDriveLane, FilmFirmLane, FilmSystemLane, freshRowsAt, freshSummaryAt } from "./film-side-lanes";
import { foldBeats, type FilmState } from "./film-state";
import { clockLabel } from "./film-views";

type Script = FilmScript<DocumentsBeat>;
type ViewProps = { laneId: string; ctx: LaneContext<DocumentsBeat>; script: Script; profile: CompanyProfile };

/** The folded state per number of landed beats, so every frame between two beats shares one object. */
const folded = new WeakMap<Script, Map<number, FilmState>>();

function stateAt(script: Script, t: number): FilmState {
  const landed = beatsUntil(script, t);
  const byCount = folded.get(script) ?? new Map<number, FilmState>();
  folded.set(script, byCount);
  const known = byCount.get(landed.length);
  if (known) return known;
  const state = foldBeats(landed);
  byCount.set(landed.length, state);
  return state;
}

/** The request leaves the firm when its email starts to travel, so "Send request" shows until then. */
function requestSentAt(script: Script, t: number, storyAt: (filmMs: number) => string): string | undefined {
  const request = script.beats.find((beat) => beat.data.kind === "email" && beat.data.email === "request");
  return request && t >= request.at ? formatWeekdayTime(storyAt(request.at)) : undefined;
}

/** A lane that shows one whole screen fills the lane body instead of stacking like a feed. */
function Fill({ children }: { children: ReactNode }) {
  return <div className="lane-fill absolute inset-3 md:inset-4">{children}</div>;
}

const driveFreshMs = 2500;

function FilmLaneView({ laneId, ctx, script, profile }: ViewProps) {
  const framed = !useNarrowScreen();
  const timeAt = useMemo(() => (filmMs: number) => clockLabel(storyTimeAt(script, filmMs)), [script]);
  const storyAt = useMemo(() => (filmMs: number) => storyTimeFromMs(storyTimeAt(script, filmMs)), [script]);
  const state = stateAt(script, ctx.t);
  switch (laneId) {
    case "firm":
      return (
        <Fill>
          <FilmFirmLane
            state={state}
            freshRows={freshRowsAt(state, ctx.t)}
            freshSummary={freshSummaryAt(state, ctx.t)}
            requestSentAt={requestSentAt(script, ctx.t, storyAt)}
          />
        </Fill>
      );
    case "client":
      return (
        <Fill>
          <FilmClientLane
            state={state}
            moment={clientMomentAt(state, ctx.t, clockLabel(ctx.storyTime))}
            profile={profile}
            framed={framed}
            timeAt={timeAt}
            storyAt={storyAt}
          />
        </Fill>
      );
    case "drive": {
      const newest = newestEntryId(state.drive);
      const fresh = newest && ctx.t - (state.filedAt[newest] ?? -Infinity) < driveFreshMs ? newest : undefined;
      return (
        <Fill>
          <FilmDriveLane state={state} freshId={fresh} firmName={profile.name} timeAt={timeAt} />
        </Fill>
      );
    }
    default: {
      const cards = <FilmSystemLane state={state} t={ctx.t} storyTime={ctx.storyTime} />;
      if (framed) return cards;
      // On a phone the feed must not grow the lane past the screen: it keeps the newest cards at
      // the bottom and lets the older ones run out under a fade at the top.
      return (
        <Fill>
          <div
            className={cx(
              "flex h-full flex-col gap-3 overflow-hidden",
              state.checks.length > 1 && "justify-end [mask-image:linear-gradient(to_bottom,transparent,#000_48px)]",
            )}
          >
            {cards}
          </div>
        </Fill>
      );
    }
  }
}

/** `renderLane` for `FilmStage`: each lane draws the folded film state with the components live mode uses. */
export function filmLaneRenderer(script: Script, profile: CompanyProfile) {
  return function renderFilmLane(lane: FilmLane, ctx: LaneContext<DocumentsBeat>): ReactNode {
    return <FilmLaneView laneId={lane.id} ctx={ctx} script={script} profile={profile} />;
  };
}
