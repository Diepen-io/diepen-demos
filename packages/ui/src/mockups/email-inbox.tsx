"use client";

import { StatusBadge, type Status } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";
import type { ConversationControls } from "./conversation";
import { ConversationFooter, slotsOnOffer, ThreadEnd } from "./conversation-parts";
import { EmailMessage, type EmailMessageProps } from "./email-message";
import { EmailThreadRow } from "./email-thread-row";
import { useScrollToLatest } from "./scroll-to-latest";
import { TypingIndicator } from "./typing-indicator";

export type EmailThread = {
  id: string;
  /** Sender name as the list shows it. */
  from: string;
  subject: string;
  snippet: string;
  time: string;
  unread?: boolean;
  status?: Status;
  hasAttachment?: boolean;
  isNew?: boolean;
  /** The messages, oldest first. Needed only for the open thread. */
  messages?: EmailMessageProps[];
};

export type EmailInboxProps = ConversationControls & {
  /** The mailbox, for example "hello@northlight.dental". */
  account: string;
  threads: EmailThread[];
  openThreadId?: string | null;
  /** Shows "<name> is writing a reply" at the end of the open thread. */
  drafting?: string | null;
  /** Live mode: the composer shows a subject field with this value, for the first email of a thread. */
  composeSubject?: string;
  className?: string;
};

/**
 * A mail client with a thread list and an open thread. Wide containers show both side by
 * side; a film lane shows only the open thread, or the list when no thread is open. With
 * `onSend` the thread pane gets a composer, and an empty inbox opens a new email.
 */
export function EmailInbox({ account, threads, openThreadId, drafting, composeSubject, className, ...controls }: EmailInboxProps) {
  const open = threads.find((thread) => thread.id === openThreadId);
  const live = Boolean(controls.onSend ?? controls.handover);
  const unread = threads.filter((thread) => thread.unread).length;
  const messages = open?.messages ?? [];
  const body = useScrollToLatest<HTMLDivElement>(`${open?.id}-${messages.length}-${drafting ?? ""}`, {
    selector: "[data-email-message]",
    pick: "last",
  });
  const showThread = Boolean(open) || live;
  const offer = slotsOnOffer(controls);

  return (
    <ChannelFrame channel="Email" icon="mail" accent="var(--channel-email)" meta={account} className={className}>
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-subtle px-4 text-body text-faint">
          <Icon name="search" size={17} />
          <span className="truncate">Search mail</span>
        </div>
        {unread > 0 && <span className="tabular hidden text-meta font-medium text-muted @md:inline">{unread} unread</span>}
      </div>
      <div className="flex min-h-0 flex-1">
        {threads.length > 0 && (
          <ul
            aria-label="Inbox"
            className={cx(
              "scroll-area min-h-0 overflow-y-auto @3xl:block @3xl:w-[38%] @3xl:shrink-0 @3xl:border-r @3xl:border-border",
              showThread ? "hidden" : "w-full",
            )}
          >
            {threads.map((thread) => (
              <EmailThreadRow key={thread.id} thread={thread} open={thread.id === open?.id} />
            ))}
          </ul>
        )}
        {showThread && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div ref={body} className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto">
              {threads.length > 1 && (
                <div className="flex items-center gap-1 px-3 pt-3 text-meta font-medium text-muted @3xl:hidden">
                  <Icon name="chevronLeft" size={16} /> Inbox
                </div>
              )}
              <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-5 @lg:px-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="min-w-0 text-title font-semibold tracking-[-0.015em]">{open?.subject ?? "New message"}</h3>
                  {open?.status && <StatusBadge status={open.status} />}
                </div>
                {messages.map((message, index) => (
                  <div key={index} data-email-message="" className={cx(index > 0 && "border-t border-border pt-4")}>
                    <EmailMessage
                      {...message}
                      subject={undefined}
                      onPickSlot={message.onPickSlot ?? offer.onPick}
                      slotsDisabled={offer.disabled}
                      slotsSpotlight={offer.spotlight}
                    />
                  </div>
                ))}
                {drafting && (
                  <div className="flex items-center gap-2 border-t border-border pt-4 text-meta text-muted">
                    <TypingIndicator label={`${drafting} is writing a reply`} className="rounded-full bg-subtle px-3 py-2.5 text-faint" />
                    {drafting} is writing a reply
                  </div>
                )}
                <ThreadEnd isEmpty={messages.length === 0} controls={controls} />
              </div>
            </div>
            {live && <ConversationFooter channel="email" controls={controls} staticBar={null} subject={messages.length === 0 ? composeSubject : undefined} />}
          </div>
        )}
      </div>
    </ChannelFrame>
  );
}
