"use client";

import { EASE_OUT } from "@diepen/ui/film/film-easing";
import { usePrefersReducedMotion } from "@diepen/ui/film/use-stage-environment";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LiveLane } from "./documents-lanes";

export type LaneProps = {
  lane: LiveLane;
  id?: string;
  /** The story is happening here right now. */
  focused?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * One party's column. The body keeps the newest content in view: it starts at the top, and once
 * it is full, older content slides up and fades out under the header.
 */
export function Lane({ lane, id, focused, className, children }: LaneProps) {
  const { bodyRef, contentRef, overflowing } = useFeedScroll();

  return (
    <section
      id={id}
      aria-label={`${lane.label}, ${lane.role}`}
      data-lane={lane.id}
      data-focused={focused || undefined}
      className={cx("panel relative isolate flex min-h-0 min-w-0 flex-col", className)}
    >
      <header className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
        <span
          className={cx(
            "grid size-10 shrink-0 place-items-center rounded-[11px]",
            lane.brand ? "bg-brand text-brand-foreground" : "bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]",
          )}
        >
          <Icon name={lane.icon ?? "user"} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[17px] leading-tight font-semibold tracking-[-0.01em] text-balance">{lane.label}</span>
          <span className="block truncate text-[14px] leading-snug text-muted">{lane.role}</span>
        </span>
        <span
          aria-hidden="true"
          className={cx(
            "size-2 shrink-0 rounded-full transition-opacity duration-300",
            lane.brand ? "bg-brand" : "bg-foreground/70",
            focused ? "opacity-100" : "opacity-0",
          )}
        />
      </header>
      <div
        ref={bodyRef}
        className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 py-4"
        style={overflowing ? { maskImage: "linear-gradient(to bottom, transparent, #000 64px)" } : undefined}
      >
        <div className="min-h-full shrink-0">
          <div ref={contentRef} className="flex flex-col gap-3">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The body aligns a frame of at least its own height to the bottom. Short content sits at the top
 * of that frame; once it overflows, the frame grows upwards and clips at the top, so the newest
 * item stays in view. When an item lands in a full lane the content jumps up; this plays that
 * jump as a short slide instead (FLIP on one element, transform only).
 */
function useFeedScroll() {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const bodyElement = bodyRef.current;
    const contentElement = contentRef.current;
    if (!bodyElement || !contentElement) return;
    let lastTop = contentElement.offsetTop;
    let lastHeight = contentElement.offsetHeight;
    let lastBodyHeight = bodyElement.clientHeight;
    const observer = new ResizeObserver(() => {
      const top = contentElement.offsetTop;
      const height = contentElement.offsetHeight;
      const bodyHeight = bodyElement.clientHeight;
      const shift = lastTop - top;
      const grew = height > lastHeight && bodyHeight === lastBodyHeight;
      if (grew && shift > 0 && shift < bodyHeight && !reduceMotion) {
        contentElement.animate(
          [{ transform: `translateY(${shift}px)` }, { transform: "translateY(0)" }],
          { duration: 560, easing: EASE_OUT },
        );
      }
      // clientHeight includes the body's 16px top and bottom padding.
      setOverflowing(height > bodyHeight - 32);
      lastTop = top;
      lastHeight = height;
      lastBodyHeight = bodyHeight;
    });
    observer.observe(contentElement);
    observer.observe(bodyElement);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return { bodyRef, contentRef, overflowing };
}
