"use client";

import { ChannelFrame } from "@diepen/ui/mockups/channel-frame";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { useState, type CSSProperties } from "react";
import { calendarHours } from "@/domain/calendar";
import type { CalendarBlock } from "@/domain/inbox-snapshot";
import { minutesOf, wallParts } from "@/domain/wall-clock";

export type CalendarViewProps = {
  /** "2026-11-11" and so on. */
  days: string[];
  blocks: CalendarBlock[];
  /** Plays the entrance for a block that just arrived. */
  isNew?: (block: CalendarBlock) => boolean;
  /** One pulse on every booked block. */
  highlight?: boolean;
  /** One day at a time, with a day switcher. */
  singleDay?: boolean;
  className?: string;
};

const dayStart = calendarHours.start * 60;
const daySpan = (calendarHours.end - calendarHours.start) * 60;
const hours = Array.from({ length: calendarHours.end - calendarHours.start }, (_, index) => calendarHours.start + index);

const looks: Record<CalendarBlock["kind"], string> = {
  busy: "bg-subtle text-faint shadow-[inset_0_0_0_1px_var(--border)]",
  offered: "border-[1.5px] border-dashed border-brand bg-brand-soft text-foreground",
  booked: "bg-brand text-brand-foreground shadow-[0_1px_2px_rgb(0_0_0/0.14),0_4px_12px_-4px_rgb(0_0_0/0.18)]",
};

const percent = (minutes: number) => `${(minutes / daySpan) * 100}%`;

/** A compact week: the whole working day fits its height, so every block shows without scrolling. */
export function CalendarView({ days, blocks, isNew, highlight, singleDay, className }: CalendarViewProps) {
  const latestBooking = blocks.findLast((block) => block.kind === "booked")?.start.slice(0, 10);
  const [picked, setPicked] = useState<string | null>(null);
  const shownDay = picked && days.includes(picked) ? picked : (latestBooking ?? days[0] ?? "");
  const shown = singleDay ? [shownDay] : days;
  const columns = { gridTemplateColumns: `2.75rem repeat(${shown.length}, minmax(0, 1fr))` } as CSSProperties;
  const first = wallParts(days[0] ?? "2026-11-11");

  return (
    <ChannelFrame channel="Calendar" icon="calendar" accent="var(--channel-calendar)" meta={singleDay ? "Day" : "Week"} className={className}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <p className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.01em]">
          {first.month} {days[0]?.slice(0, 4)}
        </p>
        {singleDay ? <DaySwitcher days={days} day={shownDay} onPick={setPicked} /> : null}
      </div>
      <div className="grid border-b border-border py-2" style={columns}>
        <span />
        {shown.map((day) => {
          const parts = wallParts(day);
          return (
            <p key={day} className="flex flex-col items-center leading-tight">
              <span className="text-[12px] font-semibold tracking-[0.06em] text-faint uppercase">{parts.weekday.slice(0, 3)}</span>
              <span className="tabular text-[18px] font-semibold">{parts.day}</span>
            </p>
          );
        })}
      </div>
      <div className="relative grid min-h-[15rem] flex-1 pt-2 pb-3" style={columns}>
        <div className="relative">
          {hours.map((hour) => (
            <span key={hour} className="tabular absolute right-2 -translate-y-1/2 text-[12px] text-faint" style={{ top: percent(hour * 60 - dayStart) }}>
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {shown.map((day) => (
          <div
            key={day}
            className="relative border-l border-border"
            style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px)", backgroundSize: `100% ${100 / hours.length}%` }}
          >
            {blocks
              .filter((block) => block.start.startsWith(day))
              .map((block) => (
                <Block key={block.id} block={block} fresh={isNew?.(block) ?? false} pulse={highlight === true && block.kind === "booked"} />
              ))}
          </div>
        ))}
      </div>
    </ChannelFrame>
  );
}

function Block({ block, fresh, pulse }: { block: CalendarBlock; fresh: boolean; pulse: boolean }) {
  const start = minutesOf(block.start) - dayStart;
  const length = Math.max(minutesOf(block.end) - minutesOf(block.start), 30);
  return (
    <div
      data-testid={block.kind === "booked" ? "calendar-booking" : undefined}
      title={`${block.title}, ${block.start.slice(11, 16)}`}
      className={cx(
        "absolute inset-x-1 flex min-h-5 items-center overflow-hidden rounded-[6px] px-1.5 transition-[background-color,border-color,color] duration-300",
        looks[block.kind],
        block.kind !== "busy" && "z-10",
        fresh && "enter",
        (fresh || pulse) && block.kind !== "busy" && "pulse-once",
      )}
      style={{ top: `calc(${percent(start)} + 1px)`, height: `calc(${percent(length)} - 2px)` }}
    >
      <p className="flex min-w-0 gap-1 text-[12px] leading-tight font-semibold">
        {block.kind === "busy" ? null : <span className="tabular shrink-0">{block.start.slice(11, 16)}</span>}
        <span className="truncate">{block.title}</span>
      </p>
    </div>
  );
}

function DaySwitcher({ days, day, onPick }: { days: string[]; day: string; onPick: (day: string) => void }) {
  const index = days.indexOf(day);
  const step = (by: number) => onPick(days[(index + by + days.length) % days.length] ?? day);
  const parts = wallParts(day);
  const button = "press inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground";
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Previous day" onClick={() => step(-1)} className={button}>
        <Icon name="chevronLeft" size={18} />
      </button>
      <span className="tabular w-[5.5rem] text-center text-[14px] font-medium">
        {parts.weekday.slice(0, 3)} {parts.day} {parts.month.slice(0, 3)}
      </span>
      <button type="button" aria-label="Next day" onClick={() => step(1)} className={button}>
        <Icon name="chevronRight" size={18} />
      </button>
    </div>
  );
}
