"use client";

import { useEffect, useRef } from "react";

export type ScrollTarget = {
  /** Elements inside the scroller to align with its top edge. */
  selector: string;
  pick: "first" | "last";
  /** Space left above the element, in pixels. */
  offset?: number;
};

/**
 * Scrolls a list to its newest content whenever `latest` changes, like a real app does.
 * Without a target it goes to the bottom; with one it puts that element at the top, so a
 * long email opens at its start. Only the list scrolls, never the page around it. The
 * `.scroll-area` class makes the jump smooth unless the visitor asked for reduced motion.
 */
export function useScrollToLatest<T extends HTMLElement>(latest: unknown, target?: ScrollTarget) {
  const ref = useRef<T>(null);
  const selector = target?.selector;
  const pick = target?.pick;
  const offset = target?.offset ?? 12;

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    if (!selector) {
      scroller.scrollTop = scroller.scrollHeight;
      return;
    }
    const matches = scroller.querySelectorAll<HTMLElement>(selector);
    const element = pick === "first" ? matches[0] : matches[matches.length - 1];
    if (!element) return;
    const top = element.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTop = Math.max(top - offset, 0);
  }, [latest, selector, pick, offset]);

  return ref;
}
