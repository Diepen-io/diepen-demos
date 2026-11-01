import { cx } from "../primitives/class-names";
import { Icon, type IconName } from "../primitives/icon";
import type { FilmTravelKind } from "./film-script";

export type TravelTokenProps = {
  kind: FilmTravelKind;
  label: string;
  /** The business sends it, so it carries the brand colour. */
  brand?: boolean;
  /** The small version for the narrow layout, where items fly between tabs. */
  compact?: boolean;
};

const icons: Record<FilmTravelKind, IconName> = { message: "chat", document: "file", event: "sparkle" };

const lifted =
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_4px_rgb(0_0_0/0.06),0_14px_32px_-10px_rgb(0_0_0/0.22)]";

/** What flies between lanes: a message bubble, a document card or an event chip. */
export function TravelToken({ kind, label, brand, compact }: TravelTokenProps) {
  const tone = brand ? "bg-brand text-brand-foreground" : "bg-surface text-foreground";
  const shape = {
    message: cx("rounded-[18px] rounded-bl-[6px]", compact ? "px-3 py-1.5" : "px-4 py-2.5"),
    document: cx("rounded-[12px]", compact ? "px-2.5 py-1.5" : "py-2 pr-4 pl-2"),
    event: cx("rounded-full", compact ? "px-3 py-1.5" : "px-4 py-2.5"),
  }[kind];

  return (
    <div
      className={cx(
        "flex items-center gap-2.5 font-medium whitespace-nowrap",
        compact ? "max-w-[170px] text-[13px]" : "max-w-[300px] text-[15px]",
        tone,
        shape,
        lifted,
      )}
    >
      {kind === "document" && !compact ? (
        <span
          className={cx(
            "grid size-8 shrink-0 place-items-center rounded-[8px]",
            brand ? "bg-brand-foreground/15" : "bg-subtle text-muted",
          )}
        >
          <Icon name={icons[kind]} size={17} />
        </span>
      ) : (
        <Icon name={icons[kind]} size={compact ? 14 : 16} className="shrink-0 opacity-80" />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}
