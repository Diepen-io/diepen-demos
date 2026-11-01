"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const NARROW_QUERY = "(max-width: 767px)";

/** True below the `md` breakpoint, where the stage shows one lane at a time. False on the server. */
export function useNarrowScreen(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(NARROW_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
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
