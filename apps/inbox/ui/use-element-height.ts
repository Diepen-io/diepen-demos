"use client";

import { useEffect, useState, type RefObject } from "react";

/** The element's height in pixels, kept up to date as it resizes. 0 before the first layout. */
export function useElementHeight(ref: RefObject<HTMLElement | null>): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setHeight(element.clientHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
