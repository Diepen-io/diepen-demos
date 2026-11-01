import { EmailMessage } from "@diepen/ui/mockups/email-message";
import { Badge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
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
    <div
      data-output="email"
      className={cx("rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--border),0_8px_24px_-14px_rgb(0_0_0/0.25)]", isNew && "enter")}
    >
      <p className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3 text-[13px] font-medium text-muted">
        Follow-up email
        {sentAt ? (
          <Badge tone="pass" icon="check">
            Sent {sentAt}
          </Badge>
        ) : (
          <Badge tone="neutral">Draft</Badge>
        )}
      </p>
      <EmailMessage
        from={{ name: from.name, email: from.email || "you@example.com" }}
        to={to}
        subject={email.subject}
        time={sentAt ?? draftedAt}
        body={email.body}
        attachments={[{ name: "Proposal.pdf", size: "1 page" }]}
        action={action}
      />
    </div>
  );
}
