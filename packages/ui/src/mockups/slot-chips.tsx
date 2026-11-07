import { spotlight as spotlightOn } from "../guide/spotlight";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import type { SlotChip } from "./conversation";

export type SlotChipsProps = {
  slots: SlotChip[];
  onPick?: (iso: string) => void;
  /** The times are no longer on offer, for example after a handover: grey and not clickable. A picked time keeps its look. */
  disabled?: boolean;
  /** The live guide points at these times while they are open to pick. */
  spotlight?: boolean;
  className?: string;
};

/** The times the assistant offered. Clickable in live mode; the film marks the picked one. */
export function SlotChips({ slots, onPick, disabled, spotlight, className }: SlotChipsProps) {
  const anyPicked = slots.some((slot) => slot.picked);
  const pickable = Boolean(onPick) && !anyPicked && !disabled;
  return (
    <ul
      aria-label="Offered times"
      data-disabled={disabled || undefined}
      className={cx("enter flex flex-wrap gap-1.5 rounded-[20px]", className)}
      {...spotlightOn(spotlight && pickable)}
    >
      {slots.map((slot) => {
        const chipClass = cx(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular transition-[background-color,box-shadow,opacity,filter] duration-200",
          slot.picked
            ? "bg-brand text-brand-foreground"
            : "bg-surface text-foreground shadow-[inset_0_0_0_1px_var(--brand-line)]",
          !slot.picked && (disabled ? "opacity-45 saturate-0" : anyPicked && "opacity-50"),
        );
        const content = (
          <>
            <Icon name={slot.picked ? "check" : "calendar"} size={14} strokeWidth={2} />
            {slot.label}
          </>
        );
        return (
          <li key={slot.iso}>
            {pickable ? (
              <button type="button" onClick={() => onPick?.(slot.iso)} className={cx(chipClass, "press cursor-pointer hover:bg-brand-soft max-sm:h-11")}>
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
