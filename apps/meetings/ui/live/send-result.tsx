"use client";

import { Icon } from "@diepen/ui/primitives/icon";
import { useEffect, useRef } from "react";
import { formatDuration } from "@/domain/timing-metric";

/** The live demo's one number: from pressing the button to pressing send. */
export function SendResult({ afterMs }: { afterMs: number }) {
  const bar = useRef<HTMLDivElement>(null);
  // The bar appears next to the button the visitor pressed; this only nudges it fully into view.
  useEffect(() => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bar.current?.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
  }, []);
  return (
    <div ref={bar} role="status" className="enter flex scroll-my-4 items-center gap-3 rounded-[14px] bg-foreground px-4 py-3.5 text-white">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
        <Icon name="check" size={17} strokeWidth={2.25} />
      </span>
      <p className="text-body font-medium sm:text-title">
        Transcript to proposal sent: <span className="tabular font-semibold">{formatDuration(afterMs)}</span>
      </p>
    </div>
  );
}
