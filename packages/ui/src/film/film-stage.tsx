"use client";

import { useReducedMotion } from "motion/react";
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { CaptionBar } from "./caption-bar";
import { EndCard } from "./end-card";
import { FilmClock } from "./film-clock";
import { FilmControls } from "./film-controls";
import { gridColumns, resolveLayout, type FilmLayout } from "./film-layout";
import {
  activeCaption,
  activeTravels,
  beatsUntil,
  focusLane,
  receivingLanes,
  storyRateAt,
  storyTimeAt,
  type FilmBeat,
  type FilmLane,
  type FilmScript,
} from "./film-script";
import { Lane } from "./lane";
import { LaneTabs } from "./lane-tabs";
import { TravelLayer } from "./travel-layer";
import { useFilm } from "./use-film";
import { useRecordMode } from "../shell/record-mode";
import { useIdlePointer, useNarrowScreen } from "./use-stage-environment";
import { useLaneAnchors } from "./use-lane-anchors";

/** What a lane renders from: its landed beats and the clocks. */
export type LaneContext<TData> = {
  lane: FilmLane;
  /** Beats that landed in this lane, oldest first. */
  beats: FilmBeat<TData>[];
  latest: FilmBeat<TData> | undefined;
  t: number;
  storyTime: number;
  /** The story is happening in this lane right now. */
  focused: boolean;
  reducedMotion: boolean;
};

export type FilmStageProps<TData> = {
  script: FilmScript<TData>;
  renderLane: (lane: FilmLane, ctx: LaneContext<TData>) => ReactNode;
  /** Column widths and stacked lanes from 768 px up. Narrower screens show one lane at a time. */
  layout?: FilmLayout;
  /** Left of the title, for example the company's brand mark. */
  brand?: ReactNode;
  /** Right end of the header, for example the "Make it yours" button. */
  actions?: ReactNode;
  /** Where "Try it live" on the end card goes. */
  liveHref?: string;
  autoplay?: boolean;
  className?: string;
};

/** The full-screen film: header with the story clock, one lane per party, caption, controls, end card. */
export function FilmStage<TData>({
  script,
  renderLane,
  layout,
  brand,
  actions,
  liveHref = "/live",
  autoplay = true,
  className,
}: FilmStageProps<TData>) {
  const film = useFilm(script, { autoplay });
  const { t } = film;
  const reducedMotion = useReducedMotion() ?? false;
  const narrow = useNarrowScreen();
  const recording = useRecordMode();
  const idle = useIdlePointer(film.playing) || recording;
  const region = useRef<HTMLDivElement>(null);
  const anchors = useLaneAnchors(region);

  const landed = beatsUntil(script, t);
  const storyTime = storyTimeAt(script, t);
  const focus = focusLane(script, t);
  const receiving = receivingLanes(script, t);
  const caption = activeCaption(script, t);
  // A tapped tab holds until the caption changes; then the view follows the story again.
  const [picked, setPicked] = useState<{ lane: string; caption: string | undefined } | null>(null);
  const shownLane = picked && picked.caption === caption?.beatId ? picked.lane : focus;
  const columns = useMemo(() => resolveLayout(script.lanes, layout), [script.lanes, layout]);
  const ticks = useMemo(
    () => script.beats.map((beat) => ({ at: beat.at, major: Boolean(beat.caption) })),
    [script.beats],
  );

  return (
    <div
      className={cx(
        "relative flex h-dvh flex-col gap-3 overflow-hidden bg-background px-4 pt-4 pb-3 md:gap-5 md:px-8 md:pt-6 md:pb-5 2xl:px-12",
        idle && "cursor-none",
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-3 max-md:w-full">
          {brand}
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.015em] md:text-[20px]">{script.title}</h1>
          <span className="shrink-0 rounded-full bg-subtle px-2.5 py-1 text-[12px] font-medium text-muted shadow-[inset_0_0_0_1px_var(--border)]">
            Film
          </span>
        </div>
        <FilmClock storyTime={storyTime} rate={storyRateAt(script, t)} />
        <div className="flex items-center justify-end gap-2 max-md:ml-auto">{actions}</div>
      </header>

      <div ref={region} className="relative flex min-h-0 flex-1 flex-col gap-3">
        <LaneTabs
          className="md:hidden"
          lanes={script.lanes}
          shownLane={shownLane}
          receiving={receiving}
          onSelect={(lane) => setPicked({ lane, caption: caption?.beatId })}
          register={anchors.register}
        />
        <div
          className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[var(--film-columns)] 2xl:gap-6"
          style={{ "--film-columns": gridColumns(columns) } as CSSProperties}
        >
          {columns.map((column) => (
            <div key={column.lanes[0]?.id} className="flex min-h-0 min-w-0 flex-col gap-4 max-md:contents 2xl:gap-6">
              {column.lanes.map((lane) => {
                const beats = landed.filter((beat) => beat.lane === lane.id);
                const ctx: LaneContext<TData> = {
                  lane,
                  beats,
                  latest: beats.at(-1),
                  t,
                  storyTime,
                  focused: lane.id === focus,
                  reducedMotion,
                };
                return (
                  <Lane
                    key={lane.id}
                    id={`film-lane-${lane.id}`}
                    lane={lane}
                    focused={lane.id === focus}
                    receiving={receiving.has(lane.id)}
                    bodyRef={anchors.register(lane.id, "body")}
                    contentRef={anchors.register(lane.id, "content")}
                    className={cx("flex-1", lane.id !== shownLane && "max-md:hidden")}
                  >
                    {renderLane(lane, ctx)}
                  </Lane>
                );
              })}
            </div>
          ))}
        </div>
        <TravelLayer
          travels={activeTravels(script, t)}
          lanes={script.lanes}
          anchors={anchors}
          mode={narrow ? "tabs" : "lanes"}
          reducedMotion={reducedMotion}
        />
        <EndCard end={script.end} visible={t >= script.end.at} onReplay={film.restart} liveHref={liveHref} />
      </div>

      <CaptionBar caption={caption} />
      {recording ? null : (
        <div className="flex justify-center">
          <FilmControls film={film} ticks={ticks} idle={idle} />
        </div>
      )}
    </div>
  );
}
