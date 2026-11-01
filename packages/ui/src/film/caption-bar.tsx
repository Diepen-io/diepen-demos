"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cx } from "../primitives/class-names";
import { EASE_OUT_POINTS } from "./film-easing";

export type CaptionBarProps = {
  caption: { beatId: string; text: string } | null;
  className?: string;
};

/**
 * One line that says what happens, so the film works without sound. Captions share one grid
 * cell and crossfade, so the bar never changes height.
 */
export function CaptionBar({ caption, className }: CaptionBarProps) {
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? 0 : 10;

  return (
    <div
      aria-live="polite"
      className={cx(
        "grid min-h-[3.2em] place-items-center px-2 text-center text-[clamp(1.125rem,1.45vw,1.875rem)] leading-[1.25] font-medium tracking-[-0.015em] md:min-h-[1.6em]",
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {caption ? (
          <motion.p
            key={caption.beatId}
            className="col-start-1 row-start-1 max-w-[52ch] text-balance"
            initial={{ opacity: 0, transform: `translateY(${offset}px)` }}
            animate={{
              opacity: 1,
              transform: "translateY(0px)",
              transition: { duration: 0.5, delay: 0.12, ease: EASE_OUT_POINTS },
            }}
            exit={{
              opacity: 0,
              transform: `translateY(${-offset / 2}px)`,
              transition: { duration: 0.25, ease: EASE_OUT_POINTS },
            }}
          >
            {caption.text}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
