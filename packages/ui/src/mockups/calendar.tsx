"use client";

import type { CSSProperties } from "react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { CalendarEventBlock, type CalendarEvent } from "./calendar-event";
import { ChannelFrame } from "./channel-frame";
import { useScrollToLatest } from "./scroll-to-latest";
import { wallDate } from "./wall-clock";

export type { CalendarEvent, CalendarEventKind } from "./calendar-event";

export type CalendarProps = {
  /** ISO dates, for example ["2026-11-11", "2026-11-12", "2026-11-13"]. One for a day view, three to seven for a week. */
  days: string[];
  startHour: number;
  endHour: number;
  events: CalendarEvent[];
  /** The ISO date drawn as today. */
  today?: string;
  /**
   * "auto" shows one day when the columns would get too narrow to read (under 22rem for up to
   * three days, under 36rem for more); "day" always shows only the focus day.
   */
  view?: "auto" | "day";
  /** The day a one-day view shows. Defaults to the day of the earliest offered or booked event, then today. */
  focusDay?: string;
  /** Defaults to the month of the first day, for example "November 2026". */
  title?: string;
  className?: string;
};

export const hourHeight = 60;

export function Calendar({ days, startHour, endHour, events, today, view = "auto", focusDay, title, className }: CalendarProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const highlighted = events.filter((event) => event.kind === "offered" || event.kind === "booked");
  const earliest = highlighted.toSorted((a, b) => a.start.localeCompare(b.start))[0];
  const earliestInDay = highlighted.toSorted((a, b) => a.start.slice(11).localeCompare(b.start.slice(11)))[0];
  const focus = focusDay ?? earliest?.start.slice(0, 10) ?? (today && days.includes(today) ? today : days[0]);
  const first = wallDate(days[0] ?? "1970-01-01");
  // Opens at the earliest offered or booked time of day, with an hour of context above it.
  const scroller = useScrollToLatest<HTMLDivElement>(`${events.length}-${earliestInDay?.id}`, {
    selector: "[data-scroll-target]",
    pick: "first",
    offset: hourHeight,
  });

  // Literal class names, so Tailwind finds them when it scans this file.
  const collapse = days.length <= 1 ? null : view === "day" ? "always" : days.length <= 3 ? "small" : "medium";
  const columns = cx(
    collapse === "always" ? "grid grid-cols-[2.75rem_minmax(0,1fr)]" : "grid grid-cols-[2.75rem_repeat(var(--days),minmax(0,1fr))]",
    collapse === "small" && "@max-[22rem]:grid-cols-[2.75rem_minmax(0,1fr)]",
    collapse === "medium" && "@max-[36rem]:grid-cols-[2.75rem_minmax(0,1fr)]",
  );
  const hideWhenNarrow = (day: string) =>
    day !== focus && (collapse === "always" ? "hidden" : collapse === "small" ? "@max-[22rem]:hidden" : collapse === "medium" && "@max-[36rem]:hidden");
  const style = { "--days": days.length } as CSSProperties;

  return (
    <ChannelFrame channel="Calendar" icon="calendar" accent="var(--channel-calendar)" meta={days.length === 1 || view === "day" ? "Day" : "Week"} className={className}>
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h3 className="min-w-0 flex-1 truncate text-title font-semibold tracking-[-0.01em]">{title ?? `${first.monthLong} ${first.year}`}</h3>
        <span className="inline-flex h-8 items-center rounded-lg px-3 text-meta font-medium shadow-[inset_0_0_0_1px_var(--border)]">Today</span>
        <Icon name="chevronLeft" size={18} className="text-muted" />
        <Icon name="chevronRight" size={18} className="text-muted" />
      </header>

      <div className={cx(columns, "border-b border-border")} style={style}>
        <span />
        {days.map((day) => {
          const date = wallDate(day);
          const isToday = day === today;
          return (
            <div key={day} className={cx("flex flex-col items-center gap-0.5 py-2", hideWhenNarrow(day))}>
              <span className={cx("text-caption font-medium tracking-[0.04em] uppercase", isToday ? "text-foreground" : "text-faint")}>{date.weekday}</span>
              <span
                className={cx(
                  "tabular inline-flex size-8 items-center justify-center rounded-full text-body font-semibold",
                  isToday ? "bg-brand text-brand-foreground" : "text-foreground",
                )}
              >
                {date.day}
              </span>
            </div>
          );
        })}
      </div>

      <div ref={scroller} className="scroll-area min-h-0 flex-1 overflow-y-auto">
        <div className={cx(columns, "relative")} style={{ ...style, height: hours.length * hourHeight }}>
          <div className="relative">
            {hours.map((hour, index) => (
              <span key={hour} className="tabular absolute right-2 -translate-y-1/2 text-caption text-faint" style={{ top: index * hourHeight }}>
                {index === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>
          {days.map((day) => (
            <div
              key={day}
              className={cx("relative border-l border-border", hideWhenNarrow(day))}
              style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px)", backgroundSize: `100% ${hourHeight}px` }}
            >
              {events
                .filter((event) => event.start.startsWith(day))
                .map((event) => (
                  <CalendarEventBlock key={event.id} event={event} startHour={startHour} hourHeight={hourHeight} isScrollTarget={event === earliestInDay} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </ChannelFrame>
  );
}
