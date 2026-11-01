"use client";

import { Avatar } from "../primitives/avatar";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";
import type { ConversationControls, ConversationMessage, Person } from "./conversation";
import { ConversationFooter, MessageExtras, ThreadEnd } from "./conversation-parts";
import { useScrollToLatest } from "./scroll-to-latest";
import { TypingIndicator } from "./typing-indicator";

export type LinkedinDmProps = ConversationControls & {
  /** The person writing in. `detail` is their headline. */
  customer: Person;
  /** The owner whose account answers. LinkedIn messages come from a person, not a page. */
  business: Person;
  messages: ConversationMessage[];
  typing?: "customer" | "business" | null;
  className?: string;
};

export function LinkedinDm({ customer, business, messages, typing, className, ...controls }: LinkedinDmProps) {
  const list = useScrollToLatest<HTMLDivElement>(`${messages.length}-${typing ?? ""}`);
  const typist = typing === "customer" ? customer : typing === "business" ? business : null;

  return (
    <ChannelFrame channel="LinkedIn" icon="briefcase" accent="var(--channel-linkedin)" meta="Messaging" className={className}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Avatar name={customer.name} src={customer.avatarUrl} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{customer.name}</p>
          {customer.detail && <p className="truncate text-meta text-muted">{customer.detail}</p>}
        </div>
        <span className="flex items-center gap-3 text-muted">
          <Icon name="more" size={22} strokeWidth={2.5} />
          <Icon name="video" size={21} />
          <Icon name="star" size={20} />
        </span>
      </header>

      <div ref={list} className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
        {messages.map((message, index) => {
          const author = message.from === "customer" ? customer : business;
          const previous = messages[index - 1];
          const startsGroup = !previous || previous.from !== message.from || Boolean(message.time);
          return (
            <div key={message.id} className={cx(message.isNew && "enter")}>
              {message.time && (
                <div className="my-3 flex items-center gap-3 text-meta font-medium tracking-[0.04em] text-faint uppercase">
                  <span className="h-px flex-1 bg-border" />
                  {message.time}
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              <div className={cx("flex gap-3", startsGroup ? "mt-3" : "mt-1")}>
                <span className="w-10 shrink-0">{startsGroup && <Avatar name={author.name} src={author.avatarUrl} size={40} />}</span>
                <div className="min-w-0 flex-1">
                  {startsGroup && <p className="text-[15px] font-semibold">{author.name}</p>}
                  <p className="text-body whitespace-pre-line text-foreground">{message.text}</p>
                  <MessageExtras message={message} controls={controls} align="start" />
                </div>
              </div>
            </div>
          );
        })}
        {typist && (
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={typist.name} src={typist.avatarUrl} size={40} />
            <TypingIndicator label={`${typist.name} is typing`} className="rounded-2xl bg-subtle text-faint" />
          </div>
        )}
        <ThreadEnd isEmpty={messages.length === 0} controls={controls} />
      </div>

      <ConversationFooter
        channel="linkedin"
        controls={controls}
        staticBar={
        <div className="border-t border-border">
          <div className="m-3 min-h-16 rounded-lg bg-subtle px-3 py-2.5 text-body text-faint">Write a message...</div>
          <div className="flex items-center gap-3 px-3 pb-3 text-muted">
            <Icon name="image" size={20} />
            <Icon name="paperclip" size={20} />
            <span className="ml-auto inline-flex h-8 items-center rounded-full bg-channel-linkedin px-4 text-sm font-semibold text-white">
              Send
            </span>
          </div>
        </div>
        }
      />
    </ChannelFrame>
  );
}
