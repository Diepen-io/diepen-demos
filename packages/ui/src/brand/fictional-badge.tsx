"use client";

import type { BadgeSize } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { useBrand } from "./brand-provider";

/** Shown whenever the active profile is one of the shipped fictional presets. `short` reads "Fictional", for phones. */
export function FictionalBadge({ size, short, className }: { size?: BadgeSize; short?: boolean; className?: string }) {
  const { profile } = useBrand();
  if (!profile.fictional) return null;
  return (
    // Plain words, not a pill: the label informs, it does not need to stand out.
    <span className={cx("whitespace-nowrap text-faint", size === "lg" ? "text-[17px]" : "text-[13px]", className)}>
      {short ? "Fictional" : "Fictional company"}
    </span>
  );
}
