"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import type { CSSProperties } from "react";
import { BrandMark } from "../brand/brand-mark";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";
import type { ConversationControls, ConversationMessage } from "./conversation";
import { ConversationFooter, MessageExtras, ThreadEnd } from "./conversation-parts";
import { useScrollToLatest } from "./scroll-to-latest";
import { TypingIndicator } from "./typing-indicator";
import { WebsitePage, type WebsitePageProps } from "./website-page";

export type ChatWidgetProps = ConversationControls & {
  company: Pick<CompanyProfile, "name" | "logo" | "colors">;
  /** The name the assistant signs with, shown in the header. */
  assistantName: string;
  /** The page the widget sits on, shown in the channel strip. */
  website?: string;
  messages: ConversationMessage[];
  typing?: "customer" | "business" | null;
  /** "page" shows the widget open on the company's website; "window" shows the chat window alone. */
  layout?: "window" | "page";
  /** Text for the website behind the widget in the "page" layout. */
  site?: Omit<WebsitePageProps, "company" | "children">;
  className?: string;
};

const card = "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.04)]";

/** A website chat in the company's own colours. "business" messages come from the assistant. */
export function ChatWidget({ company, website, layout = "window", site, className, ...rest }: ChatWidgetProps) {
  const brand = { "--brand": company.colors.brand, "--brand-foreground": company.colors.brandForeground } as CSSProperties;
  const chatWindow = <ChatWindow company={company} {...rest} />;
  return (
    <ChannelFrame channel="Website chat" icon="globe" accent="var(--muted)" meta={website} className={className}>
      <div data-brand-scope="" style={brand} className="@container flex min-h-0 flex-1 flex-col">
        {layout === "page" ? (
          <WebsitePage company={company} {...site}>
            {chatWindow}
          </WebsitePage>
        ) : (
          chatWindow
        )}
      </div>
    </ChannelFrame>
  );
}

function ChatWindow({ company, assistantName, messages, typing, ...controls }: Omit<ChatWidgetProps, "website" | "layout" | "site" | "className">) {
  const list = useScrollToLatest<HTMLDivElement>(`${messages.length}-${typing ?? ""}-${controls.notice ?? ""}`);
  return (
    <>
      <header className="flex items-center gap-3 bg-brand px-4 py-3.5 text-brand-foreground">
        <span className="rounded-[11px] p-[2px] shadow-[0_0_0_1.5px_color-mix(in_oklab,var(--brand-foreground)_40%,transparent)]">
          <BrandMark profile={company} size={32} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{company.name}</p>
          <p className="flex items-center gap-1.5 text-meta opacity-85">
            <span className="size-2 rounded-full bg-[#4ade80]" />
            {assistantName} is online
          </p>
        </div>
        <Icon name="close" size={20} className="opacity-80" />
      </header>

      <div ref={list} className="scroll-area flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[#fafafa] px-3.5 py-4">
        {messages.map((message) => {
          const visitor = message.from === "customer";
          return (
            <div key={message.id} className={cx("flex flex-col", message.isNew && "enter")}>
              {message.time && <p className="my-2 text-center text-meta text-faint">{message.time}</p>}
              <div className={cx("flex items-end gap-2", visitor ? "justify-end pl-10" : "pr-10")}>
                {!visitor && <BrandMark profile={company} size={26} />}
                <p
                  className={cx(
                    "rounded-2xl px-3.5 py-2.5 text-body whitespace-pre-line",
                    visitor ? "rounded-br-md bg-brand text-brand-foreground" : cx("rounded-bl-md", card),
                  )}
                >
                  {message.text}
                </p>
              </div>
              <div className={visitor ? "" : "pl-[34px]"}>
                <MessageExtras message={message} onPickSlot={controls.onPickSlot} align={visitor ? "end" : "start"} />
              </div>
            </div>
          );
        })}
        {typing && (
          <div className={cx("flex items-end gap-2", typing === "customer" && "justify-end")}>
            {typing === "business" && <BrandMark profile={company} size={26} />}
            <TypingIndicator
              label={typing === "business" ? `${assistantName} is typing` : "Visitor is typing"}
              className={cx("rounded-2xl", typing === "business" ? cx(card, "text-faint") : "bg-brand text-brand-foreground")}
            />
          </div>
        )}
        <ThreadEnd isEmpty={messages.length === 0} controls={controls} />
      </div>

      <ConversationFooter
        channel="chat"
        controls={controls}
        staticBar={
          <div className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2.5">
            <span className="flex-1 px-1 text-body text-faint">Write a message</span>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <Icon name="send" size={17} strokeWidth={2} />
            </span>
          </div>
        }
      />
    </>
  );
}
