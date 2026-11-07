"use client";

import { useRef, type KeyboardEvent } from "react";
import { cx } from "./class-names";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** With an href the option is a link, for switches that change the page. */
  href?: string;
};

export type SegmentedProps<T extends string> = {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  className?: string;
};

const itemClass =
  "relative inline-flex h-8 min-w-14 max-sm:h-11 cursor-pointer items-center justify-center rounded-[8px] px-3 text-meta font-medium transition-[color,background-color,box-shadow] duration-150";
const activeClass = "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.06)]";
const idleClass = "text-muted hover:text-foreground";

/** Two or three options. Buttons act as a radio group; links mark the current page. */
export function Segmented<T extends string>({ label, options, value, onChange, className }: SegmentedProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  const isLinks = options.some((option) => option.href);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isLinks || (event.key !== "ArrowRight" && event.key !== "ArrowLeft")) return;
    const index = options.findIndex((option) => option.value === value);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = options[(index + step + options.length) % options.length];
    if (!next) return;
    event.preventDefault();
    onChange?.(next.value);
    group.current?.querySelector<HTMLElement>(`[data-value="${next.value}"]`)?.focus();
  }

  return (
    <div
      ref={group}
      role={isLinks ? "navigation" : "radiogroup"}
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx("inline-flex gap-0.5 rounded-[10px] bg-subtle p-0.5 shadow-[inset_0_0_0_1px_var(--border)]", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        const classes = cx(itemClass, active ? activeClass : idleClass);
        if (option.href) {
          return (
            <a key={option.value} href={option.href} aria-current={active ? "page" : undefined} className={classes}>
              {option.label}
            </a>
          );
        }
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-value={option.value}
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(option.value)}
            className={classes}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
