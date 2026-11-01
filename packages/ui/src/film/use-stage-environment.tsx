"use client";

import { useSyncExternalStore } from "react";

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

/** True below the `md` breakpoint, where live pages show one part at a time. False on the server. */
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
