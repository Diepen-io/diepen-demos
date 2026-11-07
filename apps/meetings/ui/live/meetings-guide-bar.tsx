"use client";

import { GuideBar } from "@diepen/ui/guide/guide-bar";
import { meetingsGuideSteps, type MeetingsGuide } from "./live-guide";

export type MeetingsGuideBarProps = {
  guide: MeetingsGuide;
  onLoadSample: () => void;
  onStartOver: () => void;
  className?: string;
};

/** The live guide for call to close: the step text and the one button that belongs to it. The page scrolls, so the bar stays at the top. */
export function MeetingsGuideBar({ guide, onLoadSample, onStartOver, className }: MeetingsGuideBarProps) {
  return (
    <GuideBar
      sticky
      step={{
        id: guide.id,
        number: guide.number,
        total: meetingsGuideSteps,
        text: guide.text,
        waiting: guide.waiting,
        action: guide.action === "load-sample" ? { label: "Load the sample call", icon: "file", onClick: onLoadSample } : undefined,
        onStartOver: guide.action === "end" ? onStartOver : undefined,
      }}
      className={className}
    />
  );
}
