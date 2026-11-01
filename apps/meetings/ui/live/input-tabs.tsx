"use client";

import { cx } from "@diepen/ui/primitives/class-names";
import { Icon, type IconName } from "@diepen/ui/primitives/icon";
import type { KeyboardEvent } from "react";

export type InputTab = "record" | "paste" | "sample";

const tabs: { id: InputTab; label: string; icon: IconName }[] = [
  { id: "record", label: "Record", icon: "mic" },
  { id: "paste", label: "Paste", icon: "copy" },
  { id: "sample", label: "Sample call", icon: "file" },
];

/** The three ways into the transcript box. */
export function InputTabs({ value, onSelect }: { value: InputTab; onSelect: (tab: InputTab) => void }) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = tabs.findIndex((tab) => tab.id === value);
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    if (!next) return;
    event.preventDefault();
    onSelect(next.id);
    event.currentTarget.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
  }

  return (
    <div role="tablist" aria-label="Transcript source" onKeyDown={onKeyDown} className="flex gap-1 rounded-[12px] bg-subtle p-1 shadow-[inset_0_0_0_1px_var(--border)]">
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab={tab.id}
            id={`input-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls="input-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            className={cx(
              "flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-[13px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
              selected ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.06)]" : "text-muted hover:text-foreground",
            )}
          >
            <Icon name={tab.icon} size={15} className="shrink-0 max-sm:hidden" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
