"use client";

import { Badge } from "../primitives/badge";
import { useBrand } from "./brand-provider";

/** Shown whenever the active profile is one of the shipped fictional presets. */
export function FictionalBadge({ className }: { className?: string }) {
  const { profile } = useBrand();
  if (!profile.fictional) return null;
  return (
    <Badge tone="neutral" className={className}>
      Fictional company
    </Badge>
  );
}
