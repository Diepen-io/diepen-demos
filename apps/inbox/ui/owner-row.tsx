import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { OwnerRow as OwnerRowData } from "@/domain/inbox-snapshot";
import { ChannelMark } from "./channel-mark";
import { FilmCursor, type CursorState } from "./film-cursor";
import { StatusChip } from "./status-chip";

export type OwnerRowProps = {
  row: OwnerRowData;
  /** How the row is named on screen, for example "Ana Ruiz" or "You on Instagram". */
  name: string;
  open: boolean;
  fresh: boolean;
  cursor?: CursorState;
  onToggle?: () => void;
};

/** One conversation in the owner's list. Open, it shows why it waits and the whole thread. */
export function OwnerRow({ row, name, open, fresh, cursor, onToggle }: OwnerRowProps) {
  const urgent = row.status === "needs_human";
  const body = (
    <>
      <ChannelMark channel={row.channel} size={26} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{name}</span>
          <span className="tabular shrink-0 text-[13px] text-faint">{row.lastActivity.slice(11, 16)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 text-[14px] leading-snug text-muted [overflow-wrap:anywhere]">{row.summary}</span>
        <span className="mt-2 flex">
          <StatusChip status={row.status} />
        </span>
      </span>
    </>
  );
  return (
    <li
      data-testid="owner-row"
      data-channel={row.channel}
      className={cx(
        "relative rounded-[12px] transition-[background-color,box-shadow] duration-500",
        urgent ? "bg-wait-soft shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--wait)_30%,white)]" : "bg-surface shadow-[inset_0_0_0_1px_var(--border)]",
        fresh && "enter",
      )}
    >
      {onToggle ? (
        <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full cursor-pointer gap-3 p-3 text-left">
          {body}
        </button>
      ) : (
        <div className="flex gap-3 p-3">{body}</div>
      )}
      {open ? <RowDetail row={row} /> : null}
      {cursor ? <FilmCursor {...cursor} /> : null}
    </li>
  );
}

function RowDetail({ row }: { row: OwnerRowData }) {
  return (
    <div className="enter flex flex-col gap-2.5 border-t border-border/80 px-3 pt-3 pb-3.5">
      <ol className="flex flex-col gap-1.5">
        {(row.thread ?? []).map((message) => (
          <li
            key={message.id}
            className={cx(
              "max-w-[92%] rounded-[12px] px-3 py-2 text-[13px] leading-snug whitespace-pre-line",
              message.role === "customer" ? "self-start bg-surface shadow-[inset_0_0_0_1px_var(--border)]" : "self-end bg-brand text-brand-foreground",
            )}
          >
            <span className="line-clamp-4">{message.text}</span>
          </li>
        ))}
      </ol>
      {row.phone ? (
        <span className="inline-flex h-9 items-center gap-2 self-start rounded-[10px] bg-brand px-3.5 text-[14px] font-medium text-brand-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12)]">
          <Icon name="phone" size={15} />
          Call {row.phone}
        </span>
      ) : null}
    </div>
  );
}
