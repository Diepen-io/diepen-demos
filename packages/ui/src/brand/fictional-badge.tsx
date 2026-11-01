"use client";

import { Badge, type BadgeSize } from "../primitives/badge";
import { useBrand } from "./brand-provider";

/** Shown whenever the active profile is one of the shipped fictional presets. */
export function FictionalBadge({ size, className }: { size?: BadgeSize; className?: string }) {
  const { profile } = useBrand();
  if (!profile.fictional) return null;
  return (
    <Badge tone="neutral" size={size} className={className}>
      Fictional company
    </Badge>
  );
}
