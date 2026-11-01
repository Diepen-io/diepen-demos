"use client";

import { ChannelFrame } from "@diepen/ui/mockups/channel-frame";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { useState, type CSSProperties } from "react";
import type { CalendarBlock } from "@/domain/inbox-snapshot";
import { minutesOf, wallParts } from "@/domain/wall-clock";
import { hourLines, useHourGrid } from "./use-hour-grid";

export type CalendarViewProps = {
  /** "2026-11-11" and so on. */
  days: string[];
  blocks: CalendarBlock[];
  /** One day at a time, with a day switcher. */
  singleDay?: boolean;
  /** Start times the hour grid scrolls into view, for example the slots just offered. */
  focus?: string[];
  className?: string;
};

const looks: Record<CalendarBlock["kind"], string> = {
  busy: "bg-subtle text-faint shadow-[inset_0_0_0_1px_var(--border)]",
  offered: "border-[1.5px] border-dashed border-brand bg-brand-soft text-foreground",
  booked: "bg-brand text-brand-foreground shadow-[0_1px_2px_rgb(0_0_0/0.14),0_4px_12px_-4px_rgb(0_0_0/0.18)]",
};

/**
 * A compact week. The working day fills the height when it fits; when it does not, every hour
 * keeps a readable height and the grid scrolls to the blocks in `focus`, like a calendar app.
 */
export function CalendarView({ days, blocks, singleDay, focus = [], className }: CalendarViewProps) {
  const latestBooking = blocks.findLast((block) => block.kind === "booked")?.start.slice(0, 10);
  const [picked, setPicked] = useState<string | null>(null);
  const shownDay = picked && days.includes(picked) ? picked : (latestBooking ?? days[0] ?? "");
  const shown = singleDay ? [shownDay] : days;
  const columns = { gridTemplateColumns: `2.75rem repeat(${shown.length}, minmax(0, 1fr))` } as CSSProperties;
  const first = wallParts(days[0] ?? "2026-11-11");
  const { scroller, top, heightOf, contentHeight } = useHourGrid(focus);

  return (
    <ChannelFrame channel="Calendar" icon="calendar" accent="var(--channel-calendar)" meta={singleDay ? "Day" : "Week"} className={className}>
      <div className="flex items-center gap-2 border-b border-border py-1.5 pr-1.5 pl-4">
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
      <div ref={scroller} className="scroll-area min-h-0 flex-1 overflow-y-auto">
        <div className="relative grid" style={{ ...columns, height: contentHeight }}>
          <div className="relative">
            {hourLines.map((hour) => (
              <span key={hour} className="tabular absolute right-2 -translate-y-1/2 text-[12px] text-faint" style={{ top: top(hour * 60) }}>
                {String(hour).padStart(2, "0")}:00
              </span>
            ))}
          </div>
          {shown.map((day) => (
            <div key={day} className="relative border-l border-border">
              {hourLines.map((hour) => (
                <span key={hour} aria-hidden="true" className="absolute inset-x-0 border-t border-border" style={{ top: top(hour * 60) }} />
              ))}
              {blocks
                .filter((block) => block.start.startsWith(day))
                .map((block) => (
                  <Block
                    key={block.id}
                    block={block}
                    top={top(minutesOf(block.start))}
                    height={heightOf(minutesOf(block.end) - minutesOf(block.start))}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </ChannelFrame>
  );
}

type BlockProps = { block: CalendarBlock; top: number; height: number };

function Block({ block, top, height }: BlockProps) {
  const time = block.start.slice(11, 16);
  const busy = block.kind === "busy";
  // Two lines need 26 px; a shorter block puts the time and the title on one line.
  const stacked = height >= 26;
  return (
    <div
      data-testid={block.kind === "booked" ? "calendar-booking" : undefined}
      title={`${block.title}, ${time}`}
      className={cx(
        "absolute inset-x-0.5 flex overflow-hidden rounded-[6px] px-1 transition-[background-color,border-color,color] duration-300",
        stacked ? "items-start py-px" : "items-center",
        looks[block.kind],
        !busy && "z-10",
      )}
      style={{ top: top + 1, height: height - 2 }}
    >
      <p className={cx("flex min-w-0 text-[12px] leading-[13px] font-semibold", stacked ? "flex-col" : "gap-1")}>
        {busy ? null : <span className="tabular shrink-0">{time}</span>}
        <span className="truncate">{block.title}</span>
      </p>
    </div>
  );
}

function DaySwitcher({ days, day, onPick }: { days: string[]; day: string; onPick: (day: string) => void }) {
  const index = days.indexOf(day);
  const step = (by: number) => onPick(days[(index + by + days.length) % days.length] ?? day);
  const parts = wallParts(day);
  const button = "press inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground";
  return (
    <div className="flex items-center">
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
