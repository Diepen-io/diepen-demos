"use client";

import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { beatStart } from "./film-playback";
import { FilmGlyph } from "./film-glyphs";
import { keynoteBeatMs, keynoteStepAt, type KeynoteFilm } from "./keynote-script";
import type { FilmController } from "./use-film";

export type KeynoteControlsProps = {
  film: KeynoteFilm;
  player: FilmController;
  /** A recording shows the progress only, and nothing a viewer could press. */
  recording: boolean;
};

const iconButton =
  "press grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-foreground transition-[background-color,opacity] duration-150 hover:bg-subtle disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

/** The beat titles screen readers hear on the dots: each beat's caption, then the finale's label. */
function beatTitles(film: KeynoteFilm): string[] {
  return [...film.beats.map((beat) => beat.caption), film.finale.label];
}

/**
 * Previous, play or pause, next, and one dot per beat. Going to a beat shows it from its start;
 * a playing film keeps playing from there, a paused one stays paused.
 */
export function KeynoteControls({ film, player, recording }: KeynoteControlsProps) {
  const beatMs = keynoteBeatMs(film);
  const step = keynoteStepAt(film, player.t);
  const titles = beatTitles(film);
  const last = titles.length - 1;
  const go = (delta: -1 | 1) => player.seek(beatStart(player.t, beatMs, player.durationMs, delta));

  return (
    <div className="flex items-center justify-center gap-1 md:gap-2">
      {!recording && (
        <>
          <button type="button" aria-label="Previous beat" onClick={() => go(-1)} disabled={step === 0} className={iconButton}>
            <Icon name="chevronLeft" size={20} />
          </button>
          <button
            type="button"
            onClick={player.ended ? player.restart : player.toggle}
            aria-label={player.ended ? "Replay" : player.playing ? "Pause" : "Play"}
            className={iconButton}
          >
            {/* The play triangle carries its weight on the left, so it sits a pixel right of centre. */}
            <FilmGlyph
              name={player.ended ? "replay" : player.playing ? "pause" : "play"}
              size={18}
              className={cx(!player.ended && !player.playing && "translate-x-px")}
            />
          </button>
          <button type="button" aria-label="Next beat" onClick={() => go(1)} disabled={step === last} className={iconButton}>
            <Icon name="chevronRight" size={20} />
          </button>
        </>
      )}
      <ol aria-label="Film beats" className="ml-2 flex items-center">
        {titles.map((title, index) => (
          <li key={index}>
            <button
              type="button"
              aria-label={`Beat ${index + 1} of ${titles.length}: ${title}`}
              aria-current={index === step ? "step" : undefined}
              onClick={() => player.seek(index * beatMs)}
              disabled={recording}
              className="group grid h-11 min-w-7 cursor-pointer place-items-center px-1 disabled:cursor-default"
            >
              <span
                className={cx(
                  "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none",
                  index === step ? "w-8 bg-brand" : "w-3 bg-foreground/20 group-hover:bg-foreground/40",
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
