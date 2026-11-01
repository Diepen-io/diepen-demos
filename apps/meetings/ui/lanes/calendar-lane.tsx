import { cx } from "@diepen/ui/primitives/class-names";
import { wallDate, wallTime } from "@diepen/ui/mockups/wall-clock";

export type WeekEvent = { id: string; start: string; durationMinutes: number; title: string };

export type CalendarLaneProps = {
  /** The Monday of the week, for example "2026-11-09". */
  weekStart: string;
  events: readonly WeekEvent[];
  /** The meeting the call booked. */
  meeting?: { event: WeekEvent; agenda: string[]; isNew: boolean };
};

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The Monday of the working week an ISO date falls in. A weekend looks ahead to the next week. */
export function mondayOf(iso: string): string {
  const day = new Date(`${iso.slice(0, 10)}T00:00:00Z`).getUTCDay();
  return addDays(iso.slice(0, 10), day === 0 ? 1 : day === 6 ? 2 : 1 - day);
}

function endTime(event: WeekEvent): string {
  const [hours = 0, minutes = 0] = wallTime(event.start).split(":").map(Number);
  const total = hours * 60 + minutes + event.durationMinutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** The working week as an agenda: one row per day, the new meeting highlighted in the brand. */
export function CalendarLane({ weekStart, events, meeting }: CalendarLaneProps) {
  const days = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index));
  const first = wallDate(days[0] ?? weekStart);
  const last = wallDate(days.at(-1) ?? weekStart);
  return (
    <div data-lane="calendar" className="flex flex-col gap-2">
      <p className="text-[13px] font-medium text-muted 2xl:text-[14px]">
        {first.day} to {last.day} {last.monthLong} {last.year}
      </p>
      <ol className="flex flex-col divide-y divide-border rounded-xl shadow-[inset_0_0_0_1px_var(--border)]">
        {days.map((day) => {
          const date = wallDate(day);
          const dayEvents = events.filter((event) => event.start.startsWith(day));
          const booked = meeting?.event.start.startsWith(day) ? meeting : undefined;
          return (
            <li key={day} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-2 px-3 py-1.5 2xl:py-2">
              <span className="pt-0.5 text-[12px] leading-tight font-medium text-faint uppercase">
                {date.weekday}
                <span className="tabular block text-[15px] font-semibold text-foreground normal-case">{date.day}</span>
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                {dayEvents.map((event) => (
                  <p key={event.id} className="flex min-w-0 gap-2 rounded-md bg-subtle px-2 py-1 text-[13px] text-muted 2xl:text-[14px]">
                    <span className="tabular shrink-0">{wallTime(event.start)}</span>
                    <span className="truncate">{event.title}</span>
                  </p>
                ))}
                {booked ? <BookedMeeting {...booked} /> : null}
                {dayEvents.length === 0 && !booked ? <p className="py-1 text-[13px] text-faint">Free</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BookedMeeting({ event, agenda, isNew }: NonNullable<CalendarLaneProps["meeting"]>) {
  return (
    <div data-output="meeting" className={cx("rounded-lg bg-brand px-2.5 py-2 text-brand-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12)]", isNew && "enter pulse-once")}>
      <p className="text-[14px] leading-tight font-semibold 2xl:text-[15px]">{event.title}</p>
      <p className="tabular mt-0.5 text-[13px] opacity-85">
        {wallTime(event.start)} to {endTime(event)}, {event.durationMinutes} minutes
      </p>
      {agenda.length > 0 && <p className="mt-1 text-[12px] leading-snug opacity-85">{agenda.join(" · ")}</p>}
    </div>
  );
}
