import { highlightProps } from "@diepen/ui/film/film-highlight";
import { cx } from "@diepen/ui/primitives/class-names";
import type { CSSProperties } from "react";
import { busyBlocks } from "@/domain/calendar";
import { minutesOf, wallParts } from "@/domain/wall-clock";
import type { FilmBooking } from "@/film/film-state";

export type FilmDayProps = {
  /** "2026-11-12". */
  day: string;
  /** The night's offers and bookings, on any day. */
  bookings: FilmBooking[];
  highlight: string | undefined;
};

/** The morning every film booking falls in. */
const hours = { from: 8, to: 12 } as const;
const span = (hours.to - hours.from) * 60;

const position = (block: { start: string; end: string }): CSSProperties => {
  const top = minutesOf(block.start) - hours.from * 60;
  const bottom = Math.min(minutesOf(block.end) - hours.from * 60, span);
  // A hairline of air between blocks that touch, as in a calendar app.
  return { top: `${(top / span) * 100}%`, height: `calc(${((bottom - top) / span) * 100}% - 3px)` };
};

/** One morning of the calendar, large: what was busy, what was offered, what got booked. */
export function FilmDay({ day, bookings, highlight }: FilmDayProps) {
  const { weekday, day: date, month } = wallParts(`${day}T00:00`);
  const busy = busyBlocks(day).filter((block) => minutesOf(block.start) < hours.to * 60);
  const shown = bookings.filter((block) => block.start.startsWith(day));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="text-[22px] font-semibold tracking-[-0.015em]">
        {weekday} {date} {month}
      </p>
      <div className="relative grid min-h-0 flex-1 grid-cols-[3.75rem_minmax(0,1fr)]">
        <ol aria-hidden="true" className="relative">
          {Array.from({ length: hours.to - hours.from }, (_, index) => (
            <li
              key={index}
              className="absolute -translate-y-1/2 text-[16px] text-muted tabular-nums"
              style={{ top: `${(index / (hours.to - hours.from)) * 100}%` }}
            >
              {String(hours.from + index).padStart(2, "0")}:00
            </li>
          ))}
        </ol>
        <div className="relative border-t border-border">
          {Array.from({ length: hours.to - hours.from - 1 }, (_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${((index + 1) / (hours.to - hours.from)) * 100}%` }}
            />
          ))}
          {busy.map((block) => (
            <div
              key={block.start}
              className="absolute inset-x-0 rounded-[10px] bg-subtle px-4 py-2 text-[16px] text-muted shadow-[inset_0_0_0_1px_var(--border)]"
              style={position(block)}
            >
              Busy
            </div>
          ))}
          {shown.map((block) => (
            <div
              key={block.id}
              data-testid={block.kind === "booked" ? "calendar-booking" : undefined}
              className={cx(
                "absolute inset-x-0 flex items-center gap-3 overflow-hidden rounded-[10px] px-4 text-[18px] font-semibold whitespace-nowrap",
                block.kind === "booked"
                  ? "z-10 bg-brand text-brand-foreground"
                  : "border-2 border-dashed border-brand bg-brand-soft text-foreground",
              )}
              style={position(block)}
              {...highlightProps({ highlight }, `${block.kind === "booked" ? "booking" : "offer"}-${block.ref}`)}
            >
              <span className="tabular-nums">{block.start.slice(11, 16)}</span>
              <span className="truncate font-medium">{block.kind === "booked" ? block.title : "Offered"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
