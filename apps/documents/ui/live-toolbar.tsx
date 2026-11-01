"use client";

import { formatStoryTime } from "@/domain/story-time";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { ProviderNote } from "@diepen/ui/shell/provider-note";

export type LiveToolbarProps = {
  now: string;
  providerName: string;
  canSkip: boolean;
  onSkip: () => void;
  onStartOver: () => void;
};

/** The story clock and the two controls that move the story: three days on, or back to the start. */
export function LiveToolbar({ now, providerName, canSkip, onSkip, onStartOver }: LiveToolbarProps) {
  const [day = "", time = ""] = formatStoryTime(now).split(", ");
  const weekday = day.split(" ")[0] ?? "";
  const date = day.slice(weekday.length + 1);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="truncate text-[17px] font-semibold tracking-[-0.015em] md:text-[20px]">Daniel Okafor's 2025 tax return</h2>
        <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium shadow-[inset_0_0_0_1px_var(--brand-line)]">
          Live
        </span>
      </div>
      <div role="timer" aria-label={`Story time ${weekday} ${time}`} className="flex items-center gap-2.5">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-subtle px-2.5 text-[14px] font-medium">
          <span>{weekday}</span>
          <span className="opacity-60">{date}</span>
        </span>
        <span className="tabular text-[26px] leading-none font-semibold tracking-[-0.02em]">{time}</span>
      </div>
      <ProviderNote providerName={providerName} />
      <div className="flex items-center gap-2 max-md:w-full md:ml-auto">
        <Button variant="secondary" onClick={onSkip} disabled={!canSkip}>
          <Icon name="clock" size={16} />
          Skip 3 days
        </Button>
        <Button variant="ghost" onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </div>
  );
}
