"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cx } from "../primitives/class-names";
import { EASE_OUT_POINTS } from "./film-easing";
import { FilmGlyph } from "./film-glyphs";

export type StoryTimeParts = { weekday: string; date: string; time: string; dayKey: string };

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

/** Story time as "Tue", "3 Mar" and "21:47". Formats in UTC because story time is a wall clock. */
export function formatStoryTime(storyTime: number): StoryTimeParts {
  const value = new Date(storyTime);
  return {
    weekday: weekday.format(value),
    date: date.format(value),
    time: time.format(value),
    dayKey: value.toISOString().slice(0, 10),
  };
}

/** Story minutes per film second above which the clock counts as racing. */
const RACING_RATE = 60;

export type FilmClockProps = {
  storyTime: number;
  /** Story ms per film ms, from `storyRateAt`. */
  rate: number;
  /** "Time compressed" beside the clock. A focus film leaves it out: the racing clock says it. */
  raceHint?: boolean;
  className?: string;
};

/** The story clock. A new day flashes its date; the hint lights up while time races. */
export function FilmClock({ storyTime, rate, raceHint = true, className }: FilmClockProps) {
  const parts = formatStoryTime(storyTime);
  const [firstDay] = useState(parts.dayKey);
  const reduceMotion = useReducedMotion();
  const racing = rate > RACING_RATE;
  const newDay = parts.dayKey !== firstDay;

  return (
    <div className={cx("flex items-center gap-3", className)} role="timer" aria-label={`Story time ${parts.weekday} ${parts.time}`}>
      <motion.span
        key={parts.dayKey}
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[16px] font-medium whitespace-nowrap"
        initial={
          newDay
            ? { backgroundColor: "#171717", color: "#ffffff", opacity: 0, transform: reduceMotion ? "none" : "translateY(8px)" }
            : false
        }
        animate={{ backgroundColor: "#f4f4f5", color: "#171717", opacity: 1, transform: "translateY(0px)" }}
        transition={{
          default: { duration: 0.45, ease: EASE_OUT_POINTS },
          backgroundColor: { duration: 1.4, delay: 0.9, ease: EASE_OUT_POINTS },
          color: { duration: 1.4, delay: 0.9, ease: EASE_OUT_POINTS },
        }}
      >
        <span>{parts.weekday}</span>
        <span className="opacity-60">{parts.date}</span>
      </motion.span>
      <span className="text-[30px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{parts.time}</span>
      {raceHint ? (
        <span
          className={cx(
            "hidden items-center gap-1.5 text-[16px] font-medium whitespace-nowrap transition-colors duration-300 lg:inline-flex",
            racing ? "text-foreground" : "text-faint",
          )}
        >
          <FilmGlyph name="fastForward" size={17} className={racing && !reduceMotion ? "animate-pulse" : undefined} />
          Time compressed
        </span>
      ) : null}
    </div>
  );
}
