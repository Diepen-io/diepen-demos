"use client";

import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { KeyboardEvent } from "react";
import type { DocumentsLaneId, LiveLane } from "./documents-lanes";

export type LaneTabsProps = {
  lanes: LiveLane[];
  shownLane: DocumentsLaneId;
  /** Lanes that changed while hidden. Their tab gets a dot. */
  receiving: Set<DocumentsLaneId>;
  onSelect: (laneId: DocumentsLaneId) => void;
  className?: string;
};

/** The narrow layout shows one lane at a time; the tabs switch between them. */
export function LaneTabs({ lanes, shownLane, receiving, onSelect, className }: LaneTabsProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = lanes.findIndex((lane) => lane.id === shownLane);
    const next = lanes[(index + (event.key === "ArrowRight" ? 1 : -1) + lanes.length) % lanes.length];
    if (!next) return;
    event.preventDefault();
    onSelect(next.id);
    event.currentTarget.querySelector<HTMLElement>(`[data-lane-tab="${next.id}"]`)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Parties"
      onKeyDown={onKeyDown}
      className={cx("flex gap-1 rounded-[12px] bg-subtle p-1 shadow-[inset_0_0_0_1px_var(--border)]", className)}
    >
      {lanes.map((lane) => {
        const selected = lane.id === shownLane;
        return (
          <button
            key={lane.id}
            type="button"
            role="tab"
            id={`live-tab-${lane.id}`}
            aria-selected={selected}
            aria-controls={`live-lane-${lane.id}`}
            tabIndex={selected ? 0 : -1}
            data-lane-tab={lane.id}
            onClick={() => onSelect(lane.id)}
            className={cx(
              "relative flex h-[52px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[9px] px-1 text-[12px] leading-none font-medium transition-[background-color,color,box-shadow] duration-200",
              selected ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.06)]" : "text-muted",
            )}
          >
            <Icon name={lane.icon ?? "user"} size={17} className={cx("shrink-0", lane.brand && selected && "text-brand")} />
            <span className="max-w-full truncate">{lane.tabLabel ?? lane.role}</span>
            <span
              aria-hidden="true"
              className={cx(
                // One colour for every tab: the dot means "changed", whoever the lane belongs to.
                "absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand transition-opacity duration-300",
                receiving.has(lane.id) && !selected ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
