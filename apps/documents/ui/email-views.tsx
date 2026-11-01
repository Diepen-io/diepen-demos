"use client";

import { EmailMessage } from "@diepen/ui/mockups/email-message";
import { Avatar } from "@diepen/ui/primitives/avatar";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { ReactNode } from "react";

export type InboxEmail = {
  id: string;
  kind: "request" | "follow-up" | "reminder";
  from: { name: string; email: string };
  subject: string;
  body: string;
  /** As the inbox shows it, for example "12:50" or "Thu". */
  time: string;
  unread: boolean;
  fresh?: boolean;
};

/** The line under the subject: the first sentence after the greeting. */
function snippet(body: string): string {
  return body.split("\n\n")[1]?.split("\n")[0] ?? "";
}

export function PhoneInbox({ emails, onOpen }: { emails: InboxEmail[]; onOpen?: (id: string) => void }) {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <div className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Inbox</h2>
        {emails.some((email) => email.unread) && (
          <span className="tabular text-meta text-muted">{emails.filter((email) => email.unread).length} unread</span>
        )}
      </div>
      {emails.length === 0 ? (
        <p className="px-4 py-10 text-center text-meta text-faint">Nothing new today.</p>
      ) : (
        <ul aria-label="Inbox" className="border-t border-border">
          {[...emails].reverse().map((email) => (
            <li key={email.id} className={cx("border-b border-border", email.fresh && "enter")}>
              <button
                type="button"
                onClick={() => onOpen?.(email.id)}
                className="flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-subtle"
              >
                <span className="relative">
                  <Avatar name={email.from.name} size={36} />
                  {email.unread && <span className="absolute -top-0.5 -left-0.5 size-2.5 rounded-full bg-channel-email ring-2 ring-surface" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className={cx("min-w-0 flex-1 truncate text-[15px]", email.unread ? "font-semibold" : "font-medium text-muted")}>
                      {email.from.name}
                    </span>
                    <span className={cx("tabular shrink-0 text-meta", email.unread ? "font-semibold" : "text-faint")}>{email.time}</span>
                  </span>
                  <span className={cx("block truncate text-[14px]", email.unread ? "font-medium" : "text-muted")}>{email.subject}</span>
                  <span className="block truncate text-meta text-faint">{snippet(email.body)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmailView({ email, onBack, action }: { email: InboxEmail; onBack?: () => void; action?: ReactNode }) {
  return (
    <div className="@container flex min-h-full flex-col gap-3 bg-surface px-4 pt-3 pb-6">
      <button
        type="button"
        onClick={onBack}
        className="flex cursor-pointer items-center gap-0.5 self-start text-[14px] font-medium text-channel-email"
      >
        <Icon name="chevronLeft" size={16} /> Inbox
      </button>
      <h2 className={cx("text-[19px] leading-tight font-semibold tracking-[-0.015em]", email.fresh && "enter")}>{email.subject}</h2>
      <EmailMessage from={email.from} to="me" time={email.time} body={email.body} bodyAction={action} isNew={email.fresh} />
    </div>
  );
}
