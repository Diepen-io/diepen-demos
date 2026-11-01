import { Badge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";

/** Where a chase stands, and for one that went out, how it went out. */
export type ChaseStatus =
  | { kind: "scheduled"; progress: number }
  | { kind: "sent"; badge: string; note: string };

export type ScheduleCardModel = {
  /** For example "Reminder 2" or "Call Daniel Okafor". */
  title: string;
  /** "Thu 12 Mar, 12:50". */
  dueLabel: string;
  status: ChaseStatus;
  fresh?: boolean;
};

/** A chase that went out by itself on its day. */
export const sentOnSchedule: ChaseStatus = { kind: "sent", badge: "Sent", note: "Went out on its own" };

/** The next chase. Nobody presses anything: the bar fills with the story clock, then it goes out. */
export function ScheduleCard({ title, dueLabel, status, fresh }: ScheduleCardModel) {
  const sent = status.kind === "sent";
  const share = sent ? 1 : Math.min(Math.max(status.progress, 0), 1);
  const day = Math.min(3, Math.floor(share * 3) + 1);
  return (
    <article className={cx("flex shrink-0 flex-col gap-3 rounded-xl bg-surface p-3.5 shadow-[inset_0_0_0_1px_var(--border)]", fresh && "enter")}>
      <header className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1.5">
        <span className="flex min-w-[9rem] flex-1 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]">
            <Icon name="clock" size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] leading-snug font-semibold">{title}</span>
            <span className="tabular block text-meta text-muted">{dueLabel}</span>
          </span>
        </span>
        {sent ? (
          <Badge tone="pass" icon="check">
            {status.badge}
          </Badge>
        ) : (
          <Badge tone="info" icon="clock">
            Scheduled
          </Badge>
        )}
      </header>
      <div>
        <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-subtle shadow-[inset_0_0_0_1px_var(--border)]">
          <div className={cx("h-full origin-left rounded-full", sent ? "bg-pass" : "bg-info")} style={{ transform: `scaleX(${share})` }} />
        </div>
        <p className="tabular mt-1.5 text-meta text-muted">{sent ? status.note : `Day ${day} of 3`}</p>
      </div>
    </article>
  );
}
