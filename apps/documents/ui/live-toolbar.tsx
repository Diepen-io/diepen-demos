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
        <h2 className="truncate text-[17px] font-semibold tracking-[-0.015em] md:text-[20px]">Daniel Okafor's 2025 tax return</h2>
        <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium shadow-[inset_0_0_0_1px_var(--brand-line)]">
          Live
        </span>
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
        <span className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-subtle px-2 text-[13px] font-medium whitespace-nowrap md:px-2.5 md:text-[14px]">
          <span>{weekday}</span>
          <span className="opacity-60">{date}</span>
        </span>
        <span className="tabular text-[20px] leading-none font-semibold tracking-[-0.02em] md:text-[26px]">{time}</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <Button variant="secondary" className="max-md:h-11 max-md:px-3" onClick={onSkip} disabled={!canSkip}>
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
