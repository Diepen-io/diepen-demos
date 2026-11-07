import { Avatar } from "@diepen/ui/primitives/avatar";
import { Badge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { ReactNode } from "react";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

export type FollowUpEmailProps = {
  email: MeetingOutputs["followUpEmail"];
  from: { name: string; email: string };
  to: string;
  /** "14:34" while it is a draft. */
  draftedAt: string;
  sentAt?: string;
  /** The send button and the "Simulated email." line, in live mode. */
  action?: ReactNode;
  isNew: boolean;
};

/** The follow-up email with the proposal attached, as a draft and then as sent. */
export function FollowUpEmail({ email, from, to, draftedAt, sentAt, action, isNew }: FollowUpEmailProps) {
  return (
    <article
      data-output="email"
      className={cx("flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--border),0_8px_24px_-14px_rgb(0_0_0/0.25)]", isNew && "enter")}
    >
      <header className="flex items-start gap-3">
        <Avatar name={from.name} size={36} />
        <div className="min-w-0 flex-1 text-meta leading-snug">
          <p className="font-semibold text-foreground 2xl:text-body">{from.name}</p>
          <p className="text-faint [overflow-wrap:anywhere]">{from.email || "you@example.com"}</p>
          <p className="text-muted [overflow-wrap:anywhere]">to {to}</p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          {sentAt ? (
            <Badge tone="pass" icon="check">
              Sent {sentAt}
            </Badge>
          ) : (
            <Badge tone="neutral">Draft</Badge>
          )}
          {!sentAt && <span className="tabular text-meta text-muted">{draftedAt}</span>}
        </span>
      </header>
      <h3 className="text-body leading-snug font-semibold tracking-[-0.01em] 2xl:text-title">{email.subject}</h3>
      <div className="flex flex-col gap-3 text-body leading-[1.5] text-foreground 2xl:text-body">
        {email.body.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
      <p className="flex w-fit max-w-full items-center gap-2.5 rounded-xl py-2 pr-3.5 pl-2.5 text-meta shadow-[inset_0_0_0_1px_var(--border)]">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-fail-soft text-fail">
          <Icon name="file" size={16} />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-foreground">Proposal.pdf</span>
          <span className="block text-caption text-faint">1 page</span>
        </span>
        <Icon name="paperclip" size={14} className="ml-1 shrink-0 text-faint" />
      </p>
      {action}
    </article>
  );
}
