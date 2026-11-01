"use client";

import { useRef, type KeyboardEvent } from "react";
import { cx } from "../primitives/class-names";
import { FilmGlyph } from "./film-glyphs";
import { formatFilmTime, nextSpeed } from "./film-playback";
import type { FilmController } from "./use-film";

export type FilmTick = { at: number; major: boolean };

export type FilmControlsProps = {
  film: FilmController;
  /** Beat marks on the scrubber. Major ones carry a caption. */
  ticks: FilmTick[];
  /** Fades the bar out while the film plays and the pointer rests. It stays in the layout. */
  idle?: boolean;
  className?: string;
};

// 44 px on phones, the smallest comfortable touch target.
const iconButton =
  "press grid size-10 max-sm:size-11 shrink-0 cursor-pointer place-items-center rounded-full transition-[background-color,color,transform] duration-150";

/** Play or pause, restart, speed and a scrubber with beat marks. */
export function FilmControls({ film, ticks, idle, className }: FilmControlsProps) {
  return (
    <div
      className={cx(
        "panel flex w-full max-w-[880px] items-center gap-1.5 rounded-[18px] p-1.5 pr-2 transition-opacity duration-500 md:gap-2",
        idle ? "pointer-events-none opacity-0" : "opacity-100",
        className,
      )}
    >
      <button
        type="button"
        onClick={film.toggle}
        aria-label={film.playing ? "Pause" : "Play"}
        className={cx(iconButton, "size-11 bg-foreground text-white hover:bg-[#2a2a2a]")}
      >
        <FilmGlyph name={film.playing ? "pause" : "play"} size={18} />
      </button>
      <button
        type="button"
        onClick={film.restart}
        aria-label="Restart"
        className={cx(iconButton, "text-muted hover:bg-subtle hover:text-foreground")}
      >
        <FilmGlyph name="replay" size={18} />
      </button>
      <span className="w-10 shrink-0 text-right text-[13px] font-medium text-muted tabular-nums">
        {formatFilmTime(film.t)}
      </span>
      <Scrubber film={film} ticks={ticks} />
      <span className="w-10 shrink-0 text-[13px] font-medium text-faint tabular-nums max-sm:hidden">
        {formatFilmTime(film.durationMs)}
      </span>
      <button
        type="button"
        onClick={() => film.setSpeed(nextSpeed(film.speed))}
        aria-label={`Speed ${film.speed} times. Change speed`}
        className="press h-9 w-14 shrink-0 cursor-pointer max-sm:h-11 rounded-[10px] text-[14px] font-semibold tabular-nums transition-colors duration-150 hover:bg-subtle"
      >
        {film.speed}×
      </button>
    </div>
  );
}

function Scrubber({ film, ticks }: { film: FilmController; ticks: FilmTick[] }) {
  const resume = useRef(false);
  const progress = film.durationMs > 0 ? film.t / film.durationMs : 0;

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // The native step is 100 ms; arrows jump 5 seconds, as they do outside the scrubber.
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    film.seek(film.t + (event.key === "ArrowRight" ? 5000 : -5000));
  }

  // The side margins keep the thumb, which overhangs the track ends, clear of the time labels.
  return (
    <div className="relative mx-2 h-10 min-w-0 flex-1 max-sm:h-11">
      <input
        type="range"
        min={0}
        max={film.durationMs}
        step={100}
        value={Math.round(film.t)}
        aria-label="Film position"
        aria-valuetext={`${formatFilmTime(film.t)} of ${formatFilmTime(film.durationMs)}`}
        onChange={(event) => film.seek(Number(event.target.value))}
        onKeyDown={onKeyDown}
        onPointerDown={() => {
          resume.current = film.playing;
          film.pause();
        }}
        onPointerUp={() => {
          if (resume.current) film.play();
          resume.current = false;
        }}
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none opacity-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-border outline-offset-[6px] peer-focus-visible:outline-2 peer-focus-visible:outline-foreground"
      >
        <div className="size-full origin-left bg-foreground" style={{ transform: `scaleX(${progress})` }} />
        {ticks.map((tick) => (
          <span
            key={tick.at}
            className={cx(
              "absolute top-0 h-full w-0.5 -translate-x-1/2",
              tick.at <= film.t ? "bg-white/55" : tick.major ? "bg-[#a1a1aa]" : "bg-[#d4d4d8]",
            )}
            style={{ left: `${(tick.at / film.durationMs) * 100}%` }}
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2"
        style={{ transform: `translateX(${progress * 100}%)` }}
      >
        <span className="absolute top-0 left-0 size-3.5 -translate-1/2 rounded-full bg-foreground shadow-[0_0_0_2px_white,0_1px_3px_rgb(0_0_0/0.3)]" />
      </div>
    </div>
  );
}
