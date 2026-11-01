import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import type { SlotChip } from "./conversation";

export type SlotChipsProps = {
  slots: SlotChip[];
  onPick?: (iso: string) => void;
  className?: string;
};

/** The times the assistant offered. Clickable in live mode; the film marks the picked one. */
export function SlotChips({ slots, onPick, className }: SlotChipsProps) {
  const anyPicked = slots.some((slot) => slot.picked);
  return (
    <ul aria-label="Offered times" className={cx("enter flex flex-wrap gap-1.5", className)}>
      {slots.map((slot) => {
        const chipClass = cx(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular transition-[background-color,box-shadow,opacity] duration-200",
          slot.picked
            ? "bg-brand text-brand-foreground"
            : "bg-surface text-foreground shadow-[inset_0_0_0_1px_var(--brand-line)]",
          anyPicked && !slot.picked && "opacity-50",
        );
        const content = (
          <>
            <Icon name={slot.picked ? "check" : "calendar"} size={14} strokeWidth={2} />
            {slot.label}
          </>
        );
        return (
          <li key={slot.iso}>
            {onPick && !anyPicked ? (
              <button type="button" onClick={() => onPick(slot.iso)} className={cx(chipClass, "press cursor-pointer hover:bg-brand-soft")}>
                {content}
              </button>
            ) : (
              <span className={chipClass}>{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
