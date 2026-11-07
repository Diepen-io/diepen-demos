"use client";

import { formatStoryTime } from "@/domain/story-time";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { ProviderNote } from "@diepen/ui/shell/provider-note";

export type LiveControlsProps = {
  now: string;
  canSkip: boolean;
  onSkip: () => void;
  onStartOver: () => void;
};

/** What the visitor is looking at, and whether the answers come from Claude. */
export function LiveHeading({ providerName }: { providerName: string }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="truncate text-title font-semibold tracking-[-0.015em] md:text-heading">Daniel Okafor's 2025 tax return</h2>
      </div>
      <ProviderNote providerName={providerName} />
    </>
  );
}

/** The story clock and the two controls that move the story: three days on, or back to the start. */
export function LiveControls({ now, canSkip, onSkip, onStartOver }: LiveControlsProps) {
  const [day = "", time = ""] = formatStoryTime(now).split(", ");
  const weekday = day.split(" ")[0] ?? "";
  const date = day.slice(weekday.length + 1);
  return (
    <>
      <div role="timer" aria-label={`Story time ${weekday} ${time}`} className="flex shrink-0 items-center gap-2 md:gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-meta font-medium whitespace-nowrap md:text-body">
          <span>{weekday}</span>
          <span className="opacity-60">{date}</span>
        </span>
        <span className="tabular text-heading leading-none font-semibold tracking-[-0.02em] md:text-heading">{time}</span>
      </div>
      <div role="group" aria-label="Story controls" className="ml-auto flex items-center gap-1.5 md:gap-2">
        <Button variant="ghost" className="max-md:h-11 max-md:px-3" onClick={onSkip} disabled={!canSkip}>
          <Icon name="clock" size={16} className="max-md:hidden" />
          Skip 3 days
        </Button>
        <Button variant="ghost" className="max-md:h-11 max-md:px-2" onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </>
  );
}
