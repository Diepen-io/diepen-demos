import { cx } from "@diepen/ui/primitives/class-names";
import { wallDate, wallTime } from "@diepen/ui/mockups/wall-clock";
import { workingDays } from "@/domain/calendar-week";

export type WeekEvent = { id: string; start: string; durationMinutes: number; title: string };

export type CalendarLaneProps = {
  /** The Monday of the week, for example "2026-11-09". The lane header names the week. */
  weekStart: string;
  /** The meeting the call booked. */
  meeting?: { event: WeekEvent; agenda: string[]; isNew: boolean };
};

function endTime(event: WeekEvent): string {
  const [hours = 0, minutes = 0] = wallTime(event.start).split(":").map(Number);
  const total = hours * 60 + minutes + event.durationMinutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** The working week as an agenda: one row per day, the new meeting highlighted in the brand. */
export function CalendarLane({ weekStart, meeting }: CalendarLaneProps) {
  return (
    <ol
      data-lane="calendar"
      className="flex flex-col divide-y divide-border rounded-xl shadow-[inset_0_0_0_1px_var(--border)]"
    >
      {workingDays(weekStart).map((day) => {
        const date = wallDate(day);
        const booked = meeting?.event.start.startsWith(day) ? meeting : undefined;
        return (
          <li
            key={day}
            className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-2 px-3 py-1.5 2xl:grid-cols-[3.75rem_minmax(0,1fr)] 2xl:py-2"
          >
            <span className="tabular pt-px text-[13px] leading-5 font-semibold whitespace-nowrap text-foreground 2xl:text-[14px]">
              <span className="font-medium text-faint uppercase">{date.weekday}</span> {date.day}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              {booked ? <BookedMeeting {...booked} /> : <p className="py-0.5 text-[13px] leading-5 text-faint">Free</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function BookedMeeting({ event, agenda, isNew }: NonNullable<CalendarLaneProps["meeting"]>) {
  return (
    <div data-output="meeting" className={cx(
        "rounded-lg bg-brand px-2.5 py-1.5 text-brand-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12)]",
        isNew && "enter pulse-once",
      )}>
      <p className="text-[14px] leading-tight font-semibold 2xl:text-[15px]">{event.title}</p>
      <p className="tabular mt-0.5 text-[13px] opacity-85">
        {wallTime(event.start)} to {endTime(event)}, {event.durationMinutes} minutes
      </p>
      {agenda.length > 0 && <p className="mt-1 text-[12px] leading-snug opacity-85">{agenda.join(" · ")}</p>}
    </div>
  );
}
