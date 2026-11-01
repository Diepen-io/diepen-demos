"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { EASE_OUT } from "./film-easing";
import type { FilmLane } from "./film-script";

export type LaneProps = {
  lane: FilmLane;
  id?: string;
  /** The story is happening here right now. */
  focused?: boolean;
  /** A travelling item is about to land, or just landed. The lane glows softly. */
  receiving?: boolean;
  bodyRef?: (element: HTMLElement | null) => void;
  contentRef?: (element: HTMLElement | null) => void;
  className?: string;
  children?: ReactNode;
};

/**
 * One party's column. The body keeps the newest content in view: it starts at the top, and once
 * it is full, older content slides up and fades out under the header.
 */
export function Lane({ lane, id, focused, receiving, bodyRef, contentRef, className, children }: LaneProps) {
  const { bodyNodeRef, contentNodeRef, overflowing } = useFeedScroll();
  const setBody = useCallback(
    (element: HTMLElement | null) => {
      bodyNodeRef.current = element;
      bodyRef?.(element);
    },
    [bodyNodeRef, bodyRef],
  );
  const setContent = useCallback(
    (element: HTMLElement | null) => {
      contentNodeRef.current = element;
      contentRef?.(element);
    },
    [contentNodeRef, contentRef],
  );

  return (
    <section
      id={id}
      aria-label={`${lane.label}, ${lane.role}`}
      data-film-lane={lane.id}
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
        ref={setBody}
        className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 py-4"
        style={overflowing ? { maskImage: "linear-gradient(to bottom, transparent, #000 64px)" } : undefined}
      >
        <div className="min-h-full shrink-0">
          <div ref={setContent} className="flex flex-col gap-3">
            {children}
          </div>
        </div>
      </div>
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute -inset-px -z-10 rounded-[15px] transition-opacity",
          receiving ? "opacity-100 duration-300" : "opacity-0 duration-700",
          lane.brand
            ? "shadow-[0_0_0_2px_var(--brand-line),0_0_0_7px_var(--brand-soft)]"
            : "shadow-[0_0_0_2px_rgb(0_0_0/0.14),0_0_0_7px_rgb(0_0_0/0.035)]",
        )}
      />
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
  const bodyNodeRef = useRef<HTMLElement | null>(null);
  const contentNodeRef = useRef<HTMLElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const bodyElement = bodyNodeRef.current;
    const contentElement = contentNodeRef.current;
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

  return { bodyNodeRef, contentNodeRef, overflowing };
}
