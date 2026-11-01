"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
};

/** The one number the film ends on. Before and after side by side, the after number dominant. */
export function EndCard({ end, visible, onReplay, liveHref }: EndCardProps) {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number, distance = 14) => ({
    initial: { opacity: 0, transform: reduceMotion ? "none" : `translateY(${distance}px)` },
    animate: { opacity: 1, transform: "translateY(0px)" },
    transition: { duration: 0.7, delay, ease: EASE_OUT_POINTS },
  });

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="end"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background/90 p-4 md:absolute md:z-30 md:bg-background/85 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_POINTS } }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT_POINTS } }}
        >
          <motion.section
            aria-labelledby="film-end-metric"
            className="panel w-full max-w-[1080px] p-6 md:p-12"
            {...rise(0.05, 20)}
          >
            <h2 id="film-end-metric" className="text-[clamp(1.125rem,1.4vw,1.625rem)] font-medium tracking-[-0.015em] text-muted">
              {end.metric}
            </h2>
            <div className="mt-5 grid gap-6 md:mt-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-0">
              <motion.div className="md:border-r md:border-border md:pr-10" {...rise(0.25)}>
                <p className="text-[14px] font-medium text-faint">Before</p>
                <p className="mt-2 text-[clamp(1.75rem,2.8vw,3.25rem)] leading-none font-semibold tracking-[-0.03em] text-balance text-muted tabular-nums">
                  {end.before}
                </p>
              </motion.div>
              <motion.div className="md:pl-10" {...rise(0.6, 18)}>
                <p className="text-[14px] font-medium text-faint">Now</p>
                <p className="mt-2 text-[clamp(2.75rem,5.2vw,6.25rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-balance tabular-nums">
                  {end.after}
                </p>
              </motion.div>
            </div>
            {end.lines?.length ? (
              <motion.ul className="mt-6 grid gap-2 text-[clamp(1rem,1.1vw,1.25rem)] leading-snug md:mt-10" {...rise(0.95)}>
                {end.lines.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </motion.ul>
            ) : null}
            <motion.div
              className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6 md:mt-10"
              {...rise(1.15, 8)}
            >
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
              {end.note ? <p className="text-[14px] text-faint md:ml-auto">{end.note}</p> : null}
            </motion.div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
