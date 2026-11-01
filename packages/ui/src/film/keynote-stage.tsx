"use client";

import type { CSSProperties, ReactNode } from "react";
import { useBrand } from "../brand/brand-provider";
import { BrandMark } from "../brand/brand-mark";
import { FictionalBadge } from "../brand/fictional-badge";
import { Icon } from "../primitives/icon";
import { cx } from "../primitives/class-names";
import { useRecordMode } from "../shell/record-mode";
import { FilmGlyph } from "./film-glyphs";
import { KeynoteChip } from "./keynote-parts";
import { keynoteBeatMs, keynoteDurationMs, keynoteStepAt, type KeynoteFilm } from "./keynote-script";
import { useFilm } from "./use-film";
import { usePrefersReducedMotion } from "./use-stage-environment";

export type KeynoteStageProps = {
  film: KeynoteFilm;
  liveHref?: string;
  autoplay?: boolean;
  className?: string;
};

/** A soft wash of the brand colour, so every film reads as the company's own. */
const backdrop: CSSProperties = {
  background:
    "radial-gradient(120% 90% at 50% 0%, color-mix(in oklch, var(--brand) 22%, white) 0%, color-mix(in oklch, var(--brand) 7%, var(--background)) 55%, var(--background) 100%)",
};

export function KeynoteStage({ film, liveHref = "/live", autoplay = true, className }: KeynoteStageProps) {
  const { profile } = useBrand();
  const recording = useRecordMode();
  const reducedMotion = usePrefersReducedMotion();
  const player = useFilm({ durationMs: keynoteDurationMs(film) }, { autoplay, seekStepMs: keynoteBeatMs(film) });
  const step = keynoteStepAt(film, player.t);
  const beat = film.beats[step];
  const steps = film.beats.length + 1;

  return (
    <section
      aria-label={film.title}
      data-keynote-film={film.id}
      className={cx("relative flex h-dvh w-full flex-col overflow-hidden", recording && "cursor-none", className)}
      style={backdrop}
    >
      {/* Outside a recording the demo shell already names the company above the stage. */}
      {recording ? (
        <header className="flex items-center gap-3 px-6 pt-5 md:px-10 md:pt-7">
          {/* 52 px keeps even a three-letter monogram above 16 px in a phone feed. */}
          <BrandMark profile={profile} size={52} />
          <span className="truncate text-[20px] font-semibold tracking-[-0.01em]">{profile.name}</span>
          {profile.fictional ? <FictionalBadge size="lg" /> : null}
        </header>
      ) : null}

      <div className="flex min-h-0 flex-1 items-center justify-center px-6 md:px-10">
        <div
          key={step}
          data-keynote-step={step}
          className={cx("flex w-full max-w-[44rem] flex-col items-center text-center md:max-w-[min(72vw,72rem)]", reducedMotion ? "keynote-fade" : "keynote-rise")}
        >
          {beat ? (
            <>
              <h2 className="text-balance text-[clamp(30px,3.4vw,60px)] font-semibold leading-[1.08] tracking-[-0.025em]">
                {beat.caption}
              </h2>
              <div className="mt-[clamp(14px,2.2vh,28px)] flex w-full justify-center">{beat.element}</div>
              {beat.chip ? (
                <div className="mt-[clamp(16px,2.4vh,28px)]">
                  <KeynoteChip tone={beat.chip.tone}>{beat.chip.label}</KeynoteChip>
                </div>
              ) : null}
            </>
          ) : (
            <Finale film={film} liveHref={liveHref} />
          )}
        </div>
      </div>

      <footer className="flex items-center justify-center gap-4 pb-6 md:pb-8">
        {recording ? null : (
          <button
            type="button"
            onClick={player.ended ? player.restart : player.toggle}
            aria-label={player.ended ? "Replay" : player.playing ? "Pause" : "Play"}
            className="press grid size-11 place-items-center rounded-full bg-white/80 text-foreground shadow-sm ring-1 ring-black/5"
          >
            <FilmGlyph name={player.ended ? "replay" : player.playing ? "pause" : "play"} size={18} />
          </button>
        )}
        <ol aria-label="Film progress" className="flex items-center gap-2">
          {Array.from({ length: steps }, (_, index) => (
            <li key={index}>
              <button
                type="button"
                aria-label={`Step ${index + 1} of ${steps}`}
                aria-current={index === step ? "step" : undefined}
                onClick={() => player.seek(index * keynoteBeatMs(film))}
                disabled={recording}
                className="grid h-11 place-items-center px-1"
              >
                <span
                  className={cx(
                    "block h-1.5 rounded-full transition-all duration-300 ease-out",
                    index === step ? "w-8 bg-brand" : index < step ? "w-3 bg-foreground/40" : "w-3 bg-foreground/15",
                  )}
                />
              </button>
            </li>
          ))}
        </ol>
      </footer>
    </section>
  );
}

function Finale({ film, liveHref }: { film: KeynoteFilm; liveHref: string }): ReactNode {
  const { finale } = film;
  return (
    <div data-keynote-finale className="flex flex-col items-center">
      <p className="text-[clamp(18px,1.6vw,26px)] font-medium text-muted">{finale.label}</p>
      {/* Before, arrow and after stay on one line; the size follows the width so "2 days → 4 min" fits a phone. */}
      <p className="mt-3 flex flex-nowrap items-baseline justify-center gap-x-[0.35em] text-[clamp(32px,10.5vw,128px)] font-semibold leading-none tracking-[-0.04em] whitespace-nowrap md:text-[clamp(56px,8vw,128px)]">
        <span className="text-muted/70">{finale.before}</span>
        <span aria-label="to" className="text-[0.6em] text-muted/60">
          →
        </span>
        <span>{finale.after}</span>
      </p>
      <a
        href={liveHref}
        className="press mt-[clamp(24px,4vh,44px)] inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-[17px] font-semibold text-brand-foreground shadow-sm"
      >
        Try it live
        <Icon name="arrowRight" size={18} />
      </a>
      <p className="mt-5 max-w-[40rem] text-balance text-[16px] text-muted">{finale.note}</p>
    </div>
  );
}
