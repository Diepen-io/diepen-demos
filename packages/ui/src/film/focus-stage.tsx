"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { PageTitle } from "../shell/page-title";
import { useRecordMode } from "../shell/record-mode";
import { BeatCaption } from "./beat-caption";
import { EndCard } from "./end-card";
import { FilmClock } from "./film-clock";
import { FilmControls } from "./film-controls";
import { storyRateAt, storyTimeAt } from "./film-script";
import { FADE_IN, FADE_OUT, FocusPanel, PANEL_TRANSITION } from "./focus-panel";
import {
  activeBeat,
  partiesOnScreen,
  partiesWithNews,
  partyHistory,
  type FilmParty,
  type FocusBeat,
  type FocusFilmScript,
  type PanelRole,
} from "./focus-script";
import { PartyChips } from "./party-chips";
import { useFilm } from "./use-film";
import { useIdlePointer, usePrefersReducedMotion } from "./use-stage-environment";

/** What a panel renders from. */
export type PanelContext<TData> = {
  party: FilmParty;
  role: PanelRole;
  /** The beat on screen. */
  beat: FocusBeat<TData>;
  /** Beats that started by now and showed or touched this party, oldest first. */
  history: FocusBeat<TData>[];
  /** The id of the element to ring, from the beat. Pass it to `highlightProps`. */
  highlight: string | undefined;
  t: number;
  storyTime: number;
  reducedMotion: boolean;
};

export type FocusStageProps<TData> = {
  script: FocusFilmScript<TData>;
  /** Draws a panel's body. The stage draws the frame, the header and the transitions. */
  renderPanel: (ctx: PanelContext<TData>) => ReactNode;
  /** Left of the title, for example the company's brand mark. */
  brand?: ReactNode;
  /** Right of the title, for example the "Fictional company" badge. */
  badge?: ReactNode;
  /** Right end of the header. */
  actions?: ReactNode;
  /** Where "Try it live" on the end card goes. */
  liveHref?: string;
  autoplay?: boolean;
  className?: string;
};

/**
 * The film, one focus per beat: the caption on top, the party in focus large and centred, its
 * partner beside it, and every party as a chip below. Each beat moves one way: a new focus fades
 * through the background; a partner slides in beside a focus that stays, which glides aside.
 * Reduced motion keeps the fades and drops the slide and the glide. Phones show the focus panel only.
 */
export function FocusStage<TData>({
  script,
  renderPanel,
  brand,
  badge,
  actions,
  liveHref = "/live",
  autoplay = true,
  className,
}: FocusStageProps<TData>) {
  const film = useFilm(script, { autoplay });
  const { t } = film;
  const reducedMotion = usePrefersReducedMotion();
  const recording = useRecordMode();
  const idle = useIdlePointer(film.playing) || recording;
  const beat = activeBeat(script, t);
  const storyTime = storyTimeAt(script, t);
  const ended = t >= script.end.at;
  const ticks = useMemo(() => script.beats.map((item) => ({ at: item.at, major: true })), [script.beats]);
  const byId = useMemo(() => new Map(script.parties.map((party) => [party.id, party])), [script.parties]);

  const panel = (id: string, role: PanelRole) => {
    const party = byId.get(id);
    if (!party) return null;
    const ctx: PanelContext<TData> = {
      party,
      role,
      beat,
      history: partyHistory(script, id, t),
      highlight: beat.highlight,
      t,
      storyTime,
      reducedMotion,
    };
    return (
      <FocusPanel party={party} role={role} contentKey={beat.id}>
        {renderPanel(ctx)}
      </FocusPanel>
    );
  };

  const slide = reducedMotion ? "none" : "translateX(40px)";

  return (
    <div
      className={cx(
        "relative flex h-dvh flex-col gap-3 overflow-hidden bg-background px-4 pt-4 pb-3 md:gap-4 md:px-8 md:pt-5 md:pb-5 2xl:px-12",
        idle && "cursor-none",
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {brand}
          {/* On a phone the shell header above names the demo, and the clock needs the row. */}
          <PageTitle className="truncate text-[20px] font-semibold tracking-[-0.015em] max-md:sr-only">{script.title}</PageTitle>
          {badge}
        </div>
        <FilmClock storyTime={storyTime} rate={storyRateAt(script, t)} raceHint={false} />
        {actions ? <div className="flex items-center justify-end gap-2 max-md:ml-auto">{actions}</div> : null}
      </header>

      {/* The end card covers caption, panels and chips; the controls stay usable. */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-3 md:gap-5">
        <BeatCaption beatId={beat.id} text={beat.caption} jumpKey={film.jumps} hidden={ended} />
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
          {/* A seek or restart remounts the panels, so time that jumps never plays a transition. */}
          <AnimatePresence key={film.jumps} initial={false}>
            <motion.div
              key={beat.focus}
              data-focus={beat.focus}
              className="col-start-1 row-start-1 flex min-h-0 justify-center gap-5 2xl:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: FADE_IN }}
              exit={{ opacity: 0, transition: FADE_OUT }}
            >
              <motion.div layout={reducedMotion ? false : "position"} transition={PANEL_TRANSITION} className="min-h-0 w-full md:w-[56%] md:max-w-[52rem]">
                {panel(beat.focus, "focus")}
              </motion.div>
              <AnimatePresence initial={false} mode="popLayout">
                {beat.partner ? (
                  <motion.div
                    key={beat.partner}
                    className="min-h-0 max-md:hidden md:w-[38%] md:max-w-[36rem]"
                    initial={{ opacity: 0, transform: slide }}
                    animate={{ opacity: 1, transform: "translateX(0px)", transition: PANEL_TRANSITION }}
                    exit={{ opacity: 0, transition: FADE_OUT }}
                  >
                    {panel(beat.partner, "partner")}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
        <PartyChips parties={script.parties} onScreen={partiesOnScreen(beat)} news={partiesWithNews(script, t)} />
        <EndCard
          end={script.end}
          visible={ended}
          onReplay={film.restart}
          liveHref={liveHref}
          recording={recording}
          reducedMotion={reducedMotion}
        />
      </div>
      {recording ? null : (
        <div className="flex justify-center">
          <FilmControls film={film} ticks={ticks} idle={idle} />
        </div>
      )}
    </div>
  );
}
