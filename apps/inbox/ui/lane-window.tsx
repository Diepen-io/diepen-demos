"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@diepen/ui/primitives/class-names";

export type LaneWindowProps = {
  /** How far down the lane a travelling item lands, from 0 (top) to 1 (bottom). */
  landing?: number;
  dimmed?: boolean;
  children: ReactNode;
};

/**
 * Fills a film lane with one app window instead of a feed. The window sits on top of the lane
 * body; an invisible spacer in the flow tells the film engine where travelling items should land,
 * which is where the window shows what is new.
 */
export function LaneWindow({ landing = 0.75, dimmed, children }: LaneWindowProps) {
  const window = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = window.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setHeight(element.clientHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden="true" style={{ height: Math.round(height * landing) }} />
      <div
        ref={window}
        className={cx("absolute inset-4 flex flex-col transition-opacity duration-700", dimmed && "opacity-40")}
      >
        {children}
      </div>
    </>
  );
}
