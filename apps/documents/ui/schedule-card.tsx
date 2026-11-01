import { Badge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";

export type ScheduleCardModel = {
  /** For example "Reminder 2" or "Call the client". */
  title: string;
  /** "Thu 12 Mar, 12:50". */
  dueLabel: string;
  /** 0 when it was scheduled, 1 when it is due. */
  progress: number;
  sent: boolean;
  fresh?: boolean;
};

/** The next chase. Nobody presses anything: the bar fills with the story clock, then it goes out. */
export function ScheduleCard({ title, dueLabel, progress, sent, fresh }: ScheduleCardModel) {
  const share = Math.min(Math.max(progress, 0), 1);
  const day = Math.min(3, Math.floor(share * 3) + 1);
  return (
    <article className={cx("flex flex-col gap-3 rounded-xl bg-surface p-3.5 shadow-[inset_0_0_0_1px_var(--border)]", fresh && "enter")}>
      <header className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]">
          <Icon name="clock" size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold">{title}</span>
          <span className="tabular block truncate text-meta text-muted">{dueLabel}</span>
        </span>
        {sent ? (
          <Badge tone="pass" icon="check">
            Sent
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
        <p className="tabular mt-1.5 text-meta text-muted">{sent ? "Went out on its own" : `Day ${day} of 3`}</p>
      </div>
    </article>
  );
}
