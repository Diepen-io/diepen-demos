"use client";

import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { Button } from "../primitives/button";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { EASE_OUT_POINTS } from "./film-easing";
import { FilmGlyph } from "./film-glyphs";
import type { FilmEnd } from "./film-script";

export type EndCardProps = {
  end: FilmEnd;
  visible: boolean;
  onReplay: () => void;
  /** Where "Try it live" goes, for example "/live" with the active brand. */
  liveHref: string;
  /** `?record=1`: the posted video names the maker instead of showing buttons nobody can click. */
  recording?: boolean;
  reducedMotion?: boolean;
};

export const makerLine = "Made by diepen.ai";

// Sizes follow the overlay's height (cqh), so the card fits a 1280x720 recording without clipping.
const sizeContainer: CSSProperties = { containerType: "size" };

/** The one number the film ends on. Before and after side by side, the after number dominant. */
export function EndCard({ end, visible, onReplay, liveHref, recording = false, reducedMotion = false }: EndCardProps) {
  const rise = (delay: number, distance = 14) => ({
    initial: { opacity: 0, transform: reducedMotion ? "none" : `translateY(${distance}px)` },
    animate: { opacity: 1, transform: "translateY(0px)" },
    transition: { duration: 0.7, delay, ease: EASE_OUT_POINTS },
  });

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="end"
          style={sizeContainer}
          // Phones get an opaque cover at once: a fading, see-through layer let the page show through.
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background p-4 max-md:opacity-100! md:absolute md:z-30 md:bg-background/85 md:p-[clamp(0.5rem,3cqh,2rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_POINTS } }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT_POINTS } }}
        >
          <motion.section
            aria-labelledby="film-end-metric"
            className="panel w-full max-w-[1080px] p-6 md:p-[clamp(1.25rem,5cqh,3rem)]"
            {...rise(0.05, 20)}
          >
            <h2
              id="film-end-metric"
              className="text-[clamp(1rem,min(1.4vw,3.4cqh),1.625rem)] font-medium tracking-[-0.015em] text-muted"
            >
              {end.metric}
            </h2>
            <div className="mt-5 grid gap-6 md:mt-[clamp(0.75rem,3cqh,2rem)] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-0">
              <motion.div className="md:border-r md:border-border md:pr-10" {...rise(0.25)}>
                <p className="text-[14px] font-medium text-faint">Before</p>
                <p className="mt-2 text-[clamp(1.5rem,min(2.8vw,6.5cqh),3.25rem)] leading-none font-semibold tracking-[-0.03em] text-balance text-muted tabular-nums">
                  {end.before}
                </p>
              </motion.div>
              <motion.div className="md:pl-10" {...rise(0.6, 18)}>
                <p className="text-[14px] font-medium text-faint">Now</p>
                <p className="mt-2 text-[clamp(2.25rem,min(5.2vw,12cqh),6.25rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-balance tabular-nums">
                  {end.after}
                </p>
              </motion.div>
            </div>
            {end.lines?.length ? (
              <motion.ul
                className="mt-6 grid gap-2 text-[clamp(0.9375rem,min(1.1vw,2.8cqh),1.25rem)] leading-snug md:mt-[clamp(0.75rem,3.5cqh,2.5rem)] md:gap-[clamp(0.25rem,1cqh,0.5rem)]"
                {...rise(0.95)}
              >
                {end.lines.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </motion.ul>
            ) : null}
            <motion.div
              className="mt-6 flex flex-col gap-3 border-t border-border pt-6 md:mt-[clamp(0.75rem,3.5cqh,2.5rem)] md:pt-[clamp(0.75rem,3.5cqh,1.5rem)]"
              {...rise(1.15, 8)}
            >
              {recording ? (
                <p className="text-[15px] font-medium text-muted">{makerLine}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="secondary" size="lg" onClick={onReplay}>
                    <FilmGlyph name="replay" size={18} />
                    Replay
                  </Button>
                  <a
                    href={liveHref}
                    className={cx(
                      "press inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-base font-medium whitespace-nowrap text-brand-foreground",
                      "shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-[filter,transform] duration-150 hover:brightness-95",
                    )}
                  >
                    Try it live
                    <Icon name="arrowRight" size={18} />
                  </a>
                </div>
              )}
              {end.note ? <p className="text-[14px] text-faint">{end.note}</p> : null}
            </motion.div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
