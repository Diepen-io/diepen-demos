"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "../primitives/class-names";
import { EASE_OUT_POINTS } from "./film-easing";

export type BeatCaptionProps = {
  beatId: string;
  text: string;
  /** Changes on a seek or restart. The new caption then shows at once, without a crossfade. */
  jumpKey?: number;
  /** Hidden from 768 px up while the end card covers the stage, so it never shows through. */
  hidden?: boolean;
  className?: string;
};

/**
 * The one line that says what the beat is about, above the panels, so the film works without
 * sound. One line from 768 px up, two on phones; the height is reserved, so the panels never move.
 */
export function BeatCaption({ beatId, text, jumpKey = 0, hidden, className }: BeatCaptionProps) {
  return (
    <div
      aria-live="polite"
      className={cx(
        "grid h-[2.5em] shrink-0 place-items-center px-2 text-center text-[clamp(1.375rem,2.5vw,2.5rem)] leading-[1.2] font-semibold tracking-[-0.022em] md:h-[1.3em]",
        hidden && "md:invisible",
        className,
      )}
    >
      <AnimatePresence key={jumpKey} initial={false} mode="wait">
        <motion.p
          key={beatId}
          className="col-start-1 row-start-1 line-clamp-2 max-w-[36ch] text-balance md:line-clamp-1 md:max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE_OUT_POINTS } }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_OUT_POINTS } }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
