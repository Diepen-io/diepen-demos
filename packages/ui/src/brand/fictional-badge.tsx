"use client";

import { Badge, type BadgeSize } from "../primitives/badge";
import { useBrand } from "./brand-provider";

/** Shown whenever the active profile is one of the shipped fictional presets. `short` reads "Fictional", for phones. */
export function FictionalBadge({ size, short, className }: { size?: BadgeSize; short?: boolean; className?: string }) {
  const { profile } = useBrand();
  if (!profile.fictional) return null;
  return (
    <Badge tone="neutral" size={size} className={className}>
      {short ? "Fictional" : "Fictional company"}
    </Badge>
  );
}
