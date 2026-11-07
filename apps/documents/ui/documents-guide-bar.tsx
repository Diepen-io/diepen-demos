"use client";

import { GuideBar, type GuideAction } from "@diepen/ui/guide/guide-bar";
import { documentsGuideSteps, type DocumentsGuide } from "./live-guide";

export type DocumentsGuideBarProps = {
  guide: DocumentsGuide;
  /** A chase request is on its way, so "Skip 3 days" waits. */
  busy: boolean;
  onSkip: () => void;
  onShowUpload: () => void;
  onStartOver: () => void;
  /** On a phone another lane is open, so the spotlight on Daniel's phone is out of sight. */
  clientHidden: boolean;
  onShowClient: () => void;
  className?: string;
};

/** The live guide for the document chaser: the step text and the one button that belongs to it. */
export function DocumentsGuideBar({ guide, busy, onSkip, onShowUpload, onStartOver, clientHidden, onShowClient, className }: DocumentsGuideBarProps) {
  let action: GuideAction | undefined;
  if (guide.spotlight && clientHidden) action = { label: "Show Daniel's phone", icon: "phone", onClick: onShowClient };
  else if (guide.action === "skip") action = { label: guide.number === documentsGuideSteps ? "Skip 3 more days" : "Skip 3 days", icon: "clock", onClick: onSkip, disabled: busy };
  else if (guide.action === "show-upload") action = { label: "Open the upload page", onClick: onShowUpload };
  return (
    <GuideBar
      step={{
        id: guide.id,
        number: guide.number,
        total: documentsGuideSteps,
        text: guide.text,
        waiting: guide.waiting,
        action,
        onStartOver: guide.action === "end" ? onStartOver : undefined,
      }}
      className={className}
    />
  );
}
