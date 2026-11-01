import { cx } from "@diepen/ui/primitives/class-names";
import type { OwnerRow as OwnerRowData } from "@/domain/inbox-snapshot";
import { ChannelMark } from "./channel-mark";
import { StatusChip } from "./status-chip";

/** One conversation in the owner's list: channel, name, last activity, summary and status. */
export function OwnerRow({ row }: { row: OwnerRowData }) {
  const urgent = row.status === "needs_human";
  return (
    <li
      data-testid="owner-row"
      data-channel={row.channel}
      className={cx(
        "flex gap-3 rounded-[12px] p-3 transition-[background-color,box-shadow] duration-500",
        urgent ? "bg-wait-soft shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--wait)_30%,white)]" : "bg-surface shadow-[inset_0_0_0_1px_var(--border)]",
      )}
    >
      <ChannelMark channel={row.channel} size={26} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{row.name}</span>
          <span className="tabular shrink-0 text-[13px] text-faint">{row.lastActivity.slice(11, 16)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 text-[14px] leading-snug text-muted [overflow-wrap:anywhere]">{row.summary}</span>
        <span className="mt-2 flex">
          <StatusChip status={row.status} />
        </span>
      </span>
    </li>
  );
}
