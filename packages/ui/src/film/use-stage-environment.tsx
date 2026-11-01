"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const NARROW_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * One media query, live. The server and the first client render answer false, so hydration
 * matches the server HTML; the real answer follows right after.
 */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True below the `md` breakpoint, where the stage shows one lane at a time. False on the server. */
export function useNarrowScreen(): boolean {
  return useMediaQuery(NARROW_QUERY);
}

/**
 * The visitor asks for reduced motion. Unlike motion's `useReducedMotion`, which reads the media
 * query during the first render, this keeps the first render equal to the server's.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

/**
 * True while the film plays and the pointer has rested for `delayMs`. The stage then hides its
 * controls and cursor, so a screen recording shows only the story.
 */
export function useIdlePointer(playing: boolean, delayMs = 2500): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let timer = window.setTimeout(() => setIdle(true), delayMs);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), delayMs);
    };
    const events = ["pointermove", "pointerdown", "keydown", "focusin"] as const;
    for (const event of events) window.addEventListener(event, wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, wake);
      setIdle(false);
    };
  }, [playing, delayMs]);

  return idle;
}
