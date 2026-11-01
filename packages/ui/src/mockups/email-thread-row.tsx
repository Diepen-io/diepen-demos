import { Avatar } from "../primitives/avatar";
import { StatusBadge } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import type { EmailThread } from "./email-inbox";

/** One line of the inbox list: sender, subject, snippet, time and status. */
export function EmailThreadRow({ thread, open }: { thread: EmailThread; open: boolean }) {
  return (
    <li
      aria-current={open ? "true" : undefined}
      className={cx(
        "flex gap-3 border-b border-border px-4 py-3",
        open ? "bg-brand-soft" : thread.unread ? "bg-surface" : "bg-[#fafafa]",
        thread.isNew && "enter",
      )}
    >
      <span className="relative">
        <Avatar name={thread.from} size={36} />
        {thread.unread && <span className="absolute -top-0.5 -left-0.5 size-2.5 rounded-full bg-channel-email ring-2 ring-surface" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={cx("min-w-0 flex-1 truncate text-[15px]", thread.unread ? "font-semibold" : "font-medium text-muted")}>
            {thread.from}
          </span>
          {thread.hasAttachment && <Icon name="paperclip" size={14} className="shrink-0 text-faint" />}
          <span className={cx("tabular shrink-0 text-meta", thread.unread ? "font-semibold text-foreground" : "text-faint")}>{thread.time}</span>
        </div>
        <p className={cx("truncate text-body", thread.unread ? "font-medium text-foreground" : "text-muted")}>{thread.subject}</p>
        <p className="truncate text-meta text-faint">{thread.snippet}</p>
        {thread.status && <StatusBadge status={thread.status} className="mt-1.5" />}
      </div>
    </li>
  );
}
