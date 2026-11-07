import { cx } from "@diepen/ui/primitives/class-names";
import { Icon, type IconName } from "@diepen/ui/primitives/icon";
import type { ReactNode } from "react";
import { laneById, type LaneId } from "@/domain/lanes";

const icons: Record<LaneId, IconName> = { ai: "sparkle", crm: "briefcase", proposal: "file", calendar: "calendar" };

export type LanePanelProps = {
  id: LaneId;
  brand?: boolean;
  /** Replaces the lane's role under its label, for example the calendar's week. */
  role?: string;
  className?: string;
  children: ReactNode;
};

/** One tool lane in live mode: an icon, the lane's name and role, then its content at its natural height. */
export function LanePanel({ id, brand, role, className, children }: LanePanelProps) {
  const lane = laneById(id);
  return (
    <section aria-label={lane.label} className={cx("panel flex min-w-0 flex-col", className)}>
      <header className="flex items-center gap-3 px-4 pt-3.5 pb-1">
        <Icon name={icons[id]} size={18} className={cx("shrink-0", brand ? "text-brand" : "text-faint")} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body leading-tight font-semibold">{lane.label}</span>
          <span className="block truncate text-meta text-muted">{role ?? lane.role}</span>
        </span>
      </header>
      <div className="p-3.5">{children}</div>
    </section>
  );
}
