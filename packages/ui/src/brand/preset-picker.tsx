import type { CompanyProfile } from "@diepen/voice/profile";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { BrandMark } from "./brand-mark";

export type PresetPickerProps = {
  presets: readonly CompanyProfile[];
  activeId: string;
  onPick: (preset: CompanyProfile) => void;
};

export function PresetPicker({ presets, activeId, onPick }: PresetPickerProps) {
  return (
    <ul className="flex flex-col gap-1.5">
      {presets.map((preset) => {
        const active = preset.id === activeId;
        return (
          <li key={preset.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onPick(preset)}
              className={cx(
                "press flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150",
                active ? "bg-subtle shadow-[inset_0_0_0_1px_var(--foreground)]" : "shadow-[inset_0_0_0_1px_var(--border)] hover:bg-subtle",
              )}
            >
              <BrandMark profile={preset} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-foreground">{preset.name}</span>
                <span className="block truncate text-[13px] text-muted">
                  {preset.industry}
                  {preset.fictional && " · Fictional"}
                </span>
              </span>
              {active && <Icon name="check" size={18} className="text-foreground" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
