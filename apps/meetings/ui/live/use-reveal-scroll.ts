"use client";

import { useEffect } from "react";
import { outputSequence } from "@/domain/output-sequence";

/** On one-column screens each new output scrolls into view as it appears. */
export function useRevealScroll(revealed: number) {
  useEffect(() => {
    if (revealed === 0 || !window.matchMedia("(max-width: 1023px)").matches) return;
    const kind = outputSequence[revealed - 1];
    const element = document.querySelector(`[data-output="${kind}"]`);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element?.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
  }, [revealed]);
}
