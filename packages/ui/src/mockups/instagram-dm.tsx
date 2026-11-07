"use client";

import { Avatar } from "../primitives/avatar";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";
import type { ConversationControls, ConversationMessage, Person } from "./conversation";
import { ConversationFooter, MessageExtras, ThreadEnd } from "./conversation-parts";
import { useScrollToLatest } from "./scroll-to-latest";
import { TypingIndicator } from "./typing-indicator";

export type InstagramDmProps = ConversationControls & {
  /** The person writing to the business. `detail` is their handle. */
  customer: Person;
  /** The business account, shown in the channel strip. */
  account: string;
  messages: ConversationMessage[];
  /** Who is typing right now, if anyone. */
  typing?: "customer" | "business" | null;
  /** Shows "Seen" under the last business message. */
  seen?: boolean;
  className?: string;
};

const ring = "conic-gradient(from 210deg, var(--channel-instagram-alt), var(--channel-instagram), var(--channel-dm-from), var(--channel-instagram-alt))";
const ownBubble = "linear-gradient(160deg, var(--channel-dm-from), var(--channel-dm-to))";

function RingedAvatar({ person, size }: { person: Person; size: number }) {
  return (
    <span className="inline-flex shrink-0 rounded-full p-[2px]" style={{ background: ring }}>
      <span className="inline-flex rounded-full bg-surface p-[2px]">
        <Avatar name={person.name} src={person.avatarUrl} size={size} />
      </span>
    </span>
  );
}

export function InstagramDm({ customer, account, messages, typing, seen, className, ...controls }: InstagramDmProps) {
  const list = useScrollToLatest<HTMLDivElement>(`${messages.length}-${typing ?? ""}`);
  const lastBusiness = messages.findLastIndex((message) => message.from === "business");

  return (
    <ChannelFrame channel="Instagram" icon="chat" accent="var(--channel-instagram)" meta={account} className={className}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <RingedAvatar person={customer} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold">{customer.name}</p>
          {customer.detail && <p className="truncate text-meta text-faint">{customer.detail}</p>}
        </div>
        <span className="flex items-center gap-3.5 text-foreground">
          <Icon name="phone" size={21} />
          <Icon name="video" size={22} />
          <Icon name="info" size={21} />
        </span>
      </header>

      <div ref={list} className="scroll-area flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3.5 py-4">
        <div className="mb-4 flex flex-col items-center gap-1.5 text-center">
          <RingedAvatar person={customer} size={64} />
          <p className="mt-1 text-body font-semibold">{customer.name}</p>
          {customer.detail && <p className="text-meta text-faint">{customer.detail} · Instagram</p>}
        </div>
        {messages.map((message, index) => {
          const own = message.from === "business";
          const next = messages[index + 1];
          const lastInGroup = !next || next.from !== message.from || Boolean(next.time);
          return (
            <div key={message.id} className={cx("flex flex-col", message.isNew && "enter")}>
              {message.time && <p className="my-3 text-center text-meta font-medium text-faint">{message.time}</p>}
              <div className={cx("flex items-end gap-2", own ? "justify-end pl-12" : "pr-12")}>
                {!own && (
                  <span className="w-7 shrink-0">{lastInGroup && <Avatar name={customer.name} src={customer.avatarUrl} size={28} />}</span>
                )}
                <p
                  className={cx("rounded-[22px] px-3.5 py-2 text-body whitespace-pre-line", own ? "text-white" : "bg-[#efeff0] text-foreground")}
                  style={own ? { background: ownBubble } : undefined}
                >
                  {message.text}
                </p>
              </div>
              <div className={own ? "pl-12" : "pl-9"}>
                <MessageExtras message={message} controls={controls} align={own ? "end" : "start"} />
              </div>
              {own && seen && index === lastBusiness && <p className="mt-1 mr-1 self-end text-meta text-faint">Seen</p>}
            </div>
          );
        })}
        {typing && (
          <div className={cx("flex items-end gap-2", typing === "business" && "justify-end")}>
            {typing === "customer" && <Avatar name={customer.name} src={customer.avatarUrl} size={28} />}
            <TypingIndicator
              label={typing === "customer" ? `${customer.name} is typing` : "Reply being written"}
              className={cx("rounded-[22px]", typing === "customer" ? "bg-[#efeff0] text-faint" : "text-white/85")}
              style={typing === "business" ? { background: ownBubble } : undefined}
            />
          </div>
        )}
        <ThreadEnd isEmpty={messages.length === 0} controls={controls} />
      </div>

      <ConversationFooter
        channel="instagram"
        controls={controls}
        staticBar={
        <div className="px-3 pb-3">
          <div className="flex h-11 items-center gap-2.5 rounded-full px-1.5 shadow-[inset_0_0_0_1px_var(--border)]">
            <span className="inline-flex size-8 items-center justify-center rounded-full text-white" style={{ background: ownBubble }}>
              <Icon name="image" size={16} strokeWidth={2} />
            </span>
            <span className="flex-1 text-body text-faint">Message...</span>
            <span className="flex items-center gap-3 pr-2.5 text-foreground">
              <Icon name="mic" size={20} />
              <Icon name="heart" size={20} />
            </span>
          </div>
        </div>
        }
      />
    </ChannelFrame>
  );
}
