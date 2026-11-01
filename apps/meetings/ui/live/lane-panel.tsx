import { cx } from "@diepen/ui/primitives/class-names";
import { Icon, type IconName } from "@diepen/ui/primitives/icon";
import type { ReactNode } from "react";
import { laneById, type LaneId } from "@/domain/lanes";

const icons: Record<LaneId, IconName> = { call: "mic", ai: "sparkle", crm: "briefcase", proposal: "file", calendar: "calendar" };

/** One tool lane in live mode: the same header as in the film, content at its natural height. */
export function LanePanel({ id, brand, className, children }: { id: LaneId; brand?: boolean; className?: string; children: ReactNode }) {
  const lane = laneById(id);
  return (
    <section aria-label={lane.label} className={cx("panel flex min-w-0 flex-col", className)}>
      <header className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
        <span
          className={cx(
            "grid size-8 shrink-0 place-items-center rounded-[9px]",
            brand ? "bg-brand text-brand-foreground" : "bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]",
          )}
        >
          <Icon name={icons[id]} size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] leading-tight font-semibold">{lane.label}</span>
          <span className="block truncate text-[13px] text-muted">{lane.role}</span>
        </span>
      </header>
      <div className="p-3.5">{children}</div>
    </section>
  );
}
