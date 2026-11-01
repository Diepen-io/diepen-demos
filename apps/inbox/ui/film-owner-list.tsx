import { highlightProps } from "@diepen/ui/film/film-highlight";
import type { FilmOwnerRow } from "@/film/film-state";
import { ChannelMark } from "./channel-mark";
import { StatusChip } from "./status-chip";

export type FilmOwnerListProps = {
  rows: FilmOwnerRow[];
  /** Shows only this conversation's row: what just landed, before the whole list at 08:00. */
  only?: string;
  highlight: string | undefined;
};

/** The owner's list, large: who wrote, on which channel, and where each conversation stands. */
export function FilmOwnerList({ rows, only, highlight }: FilmOwnerListProps) {
  const shown = only ? rows.filter((row) => row.id === only) : rows;
  return (
    <ol aria-label="Owner view" className="my-auto flex flex-col gap-3">
      {shown.map((row) => (
        <li
          key={row.id}
          data-testid="owner-row"
          data-channel={row.channel}
          className="flex items-center gap-4 rounded-[14px] px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
          {...highlightProps({ highlight }, `row-${row.id}`)}
        >
          <ChannelMark channel={row.channel} size={36} />
          <span className="min-w-0 flex-1 truncate text-[20px] font-semibold tracking-[-0.01em]">{row.name}</span>
          <StatusChip status={row.status} size="lg" />
        </li>
      ))}
    </ol>
  );
}
