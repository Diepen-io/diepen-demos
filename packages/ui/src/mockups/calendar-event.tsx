import { cx } from "../primitives/class-names";
import { wallMinutes, wallTime } from "./wall-clock";

export type CalendarEventKind = "busy" | "free" | "offered" | "booked";

export type CalendarEvent = {
  id: string;
  /** Local ISO date and time, for example "2026-11-12T09:00". Shown as written, never converted. */
  start: string;
  end: string;
  kind: CalendarEventKind;
  title?: string;
  /** Plays the entrance and a short pulse, for an event that was just added. */
  isNew?: boolean;
  /** One pulse without the entrance, for a booking the film points back to. */
  emphasis?: boolean;
};

const looks: Record<CalendarEventKind, string> = {
  busy: "bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]",
  free: "border border-dashed border-[#d4d4d8] text-faint",
  offered: "border-[1.5px] border-dashed border-brand bg-brand-soft/70 text-foreground",
  booked: "bg-brand text-brand-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12)]",
};

const fallbackTitle: Record<CalendarEventKind, string> = { busy: "Busy", free: "Free", offered: "Offered", booked: "Booked" };

type CalendarEventBlockProps = { event: CalendarEvent; startHour: number; hourHeight: number; isScrollTarget?: boolean };

export function CalendarEventBlock({ event, startHour, hourHeight, isScrollTarget }: CalendarEventBlockProps) {
  const start = wallMinutes(event.start);
  const top = ((start - startHour * 60) / 60) * hourHeight;
  const height = Math.max(((wallMinutes(event.end) - start) / 60) * hourHeight - 3, 22);
  const highlight = event.kind === "offered" || event.kind === "booked";
  return (
    <div
      data-scroll-target={isScrollTarget ? "" : undefined}
      className={cx(
        "absolute inset-x-1 overflow-hidden rounded-md px-2 py-1 transition-[background-color,border-color,color] duration-300",
        looks[event.kind],
        event.isNew && "enter",
        (event.isNew === true || event.emphasis === true) && highlight && "pulse-once",
      )}
      style={{ top: top + 1.5, height }}
    >
      <p className="truncate text-meta leading-tight font-semibold">{event.title ?? fallbackTitle[event.kind]}</p>
      {height > 40 && (
        <p className="tabular truncate text-caption opacity-80">
          {wallTime(event.start)}
          <span className="hidden @2xl:inline"> to {wallTime(event.end)}</span>
        </p>
      )}
    </div>
  );
}
