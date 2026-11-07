"use client";

import { GuideBar, type GuideAction } from "@diepen/ui/guide/guide-bar";
import { inboxGuideSteps, type InboxGuide } from "./live-guide";

export type InboxGuideBarProps = {
  guide: InboxGuide;
  onAskTime: () => void;
  onAskRefund: () => void;
  onStartOver: () => void;
  className?: string;
};

/** The live guide for the inbox: the step text and the one button that belongs to it. */
export function InboxGuideBar({ guide, onAskTime, onAskRefund, onStartOver, className }: InboxGuideBarProps) {
  let action: GuideAction | undefined;
  if (guide.action === "ask-time") action = { label: "Ask for a time", icon: "calendar", onClick: onAskTime };
  else if (guide.action === "ask-refund") action = { label: "Ask for a refund", icon: "chat", onClick: onAskRefund };
  return (
    <GuideBar
      step={{
        id: guide.id,
        number: guide.number,
        total: inboxGuideSteps,
        text: guide.text,
        waiting: guide.waiting,
        action,
        onStartOver: guide.action === "end" ? onStartOver : undefined,
      }}
      className={className}
    />
  );
}
