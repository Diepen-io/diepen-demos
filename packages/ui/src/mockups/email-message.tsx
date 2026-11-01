import type { ReactNode } from "react";
import { Avatar } from "../primitives/avatar";
import { Badge } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import type { SlotChip } from "./conversation";
import { FileIcon, fileKindOf } from "./file-icon";
import { SlotChips } from "./slot-chips";

export type EmailAttachment = { name: string; size?: string };

export type EmailMessageProps = {
  from: { name: string; email: string };
  /** Recipients as written in the To line, for example "me" or "anna@hoffmann.de". */
  to: string;
  /** Shown above the message when it stands alone. A thread shows its subject once. */
  subject?: string;
  time: string;
  /** Paragraphs separated by blank lines. */
  body: string;
  attachments?: EmailAttachment[];
  /** A marker next to the sender, for example "Sent by your assistant". */
  tag?: ReactNode;
  /** Shows "Draft" or "Sent" next to the time, for an email the system wrote. */
  state?: "draft" | "sent";
  /** A call to action inside the body, after the text, for example "Upload and sign". */
  bodyAction?: ReactNode;
  /** A button under the email, for example "Send" on a draft. */
  action?: ReactNode;
  /** Times offered in this email, shown as chips under the body. */
  slots?: SlotChip[];
  onPickSlot?: (iso: string) => void;
  /** The offered times are no longer on offer, for example after a handover. */
  slotsDisabled?: boolean;
  /** A quiet line under the email, for example "Replied in 1.8 s". */
  meta?: string;
  isNew?: boolean;
  className?: string;
};

export function EmailMessage(props: EmailMessageProps) {
  const { from, to, subject, time, body, attachments, tag, state, bodyAction, action, slots, onPickSlot, slotsDisabled, meta, isNew, className } = props;
  const paragraphs = body.split(/\n{2,}/);
  const hasExtras = Boolean(slots?.length || meta || action);
  return (
    <article className={cx("flex flex-col gap-3", isNew && "enter", className)}>
      {subject && <h3 className="text-xl font-semibold tracking-[-0.015em] text-foreground">{subject}</h3>}
      <header className="flex items-start gap-3">
        <Avatar name={from.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-[15px] font-semibold text-foreground">{from.name}</span>
            <span className="truncate text-meta text-faint">&lt;{from.email}&gt;</span>
          </p>
          <p className="truncate text-meta text-muted">to {to}</p>
          {tag && <div className="mt-1.5">{tag}</div>}
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
          <span className="tabular text-meta text-muted">{time}</span>
          {state === "draft" && <Badge tone="neutral">Draft</Badge>}
          {state === "sent" && (
            <Badge tone="pass" icon="check">
              Sent
            </Badge>
          )}
        </span>
      </header>
      <div className="flex flex-col gap-3 text-body text-foreground @lg:pl-[52px]">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
        {bodyAction && <div className="py-1">{bodyAction}</div>}
      </div>
      {attachments && attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2 @lg:pl-[52px]">
          {attachments.map((attachment) => (
            <li
              key={attachment.name}
              className="flex max-w-full min-w-0 items-center gap-2.5 rounded-xl py-2 pr-3.5 pl-2.5 shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <FileIcon kind={fileKindOf(attachment.name)} size={26} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{attachment.name}</span>
                {attachment.size && <span className="tabular block text-[12px] text-faint">{attachment.size}</span>}
              </span>
              <Icon name="paperclip" size={14} className="ml-1 shrink-0 text-faint" />
            </li>
          ))}
        </ul>
      )}
      {hasExtras && (
        <div className="flex flex-col items-start gap-2 @lg:pl-[52px]">
          {slots && slots.length > 0 && <SlotChips slots={slots} onPick={onPickSlot} disabled={slotsDisabled} />}
          {meta && <p className="tabular text-meta text-faint">{meta}</p>}
          {action}
        </div>
      )}
    </article>
  );
}
