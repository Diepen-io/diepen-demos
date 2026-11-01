"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import type { ChannelId } from "./channel-looks";
import type { ConversationControls } from "./conversation";

export type ComposerProps = {
  channel: ChannelId;
  onSend: NonNullable<ConversationControls["onSend"]>;
  disabled?: boolean;
  /** Email only: shows a subject field with this starting value, for the first message of a thread. */
  subject?: string;
};

const placeholders: Record<ChannelId, string> = {
  email: "Write your email",
  instagram: "Message...",
  linkedin: "Write a message...",
  chat: "Write a message",
};

// 16px below the sm breakpoint, so iOS Safari does not zoom into the field.
const fieldText = "bg-transparent text-base text-foreground placeholder:text-faint focus:outline-none sm:text-[15px]";

/** A working message field in the look of each channel, for live mode. */
export function Composer({ channel, onSend, disabled, subject: initialSubject }: ComposerProps) {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState(initialSubject ?? "");
  const empty = text.trim() === "";

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (empty || disabled) return;
    const sent = text.trim();
    setText("");
    const accepted = await onSend(sent, initialSubject === undefined ? undefined : subject.trim() || initialSubject);
    if (accepted === false) setText(sent);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const sendsOnEnter = channel !== "email" || event.metaKey || event.ctrlKey;
    if (event.key === "Enter" && !event.shiftKey && sendsOnEnter) void send(event);
  }

  const field = {
    value: text,
    disabled,
    placeholder: placeholders[channel],
    "aria-label": "Message",
    onKeyDown,
    onChange: (event: { target: { value: string } }) => setText(event.target.value),
  };

  if (channel === "instagram") {
    return (
      <form onSubmit={send} className="px-3 pb-3">
        <div className="flex h-11 items-center gap-2.5 rounded-full pr-4 pl-4 shadow-[inset_0_0_0_1px_var(--border)] focus-within:shadow-[inset_0_0_0_1px_#a1a1aa]">
          <input {...field} className={cx(fieldText, "min-w-0 flex-1")} />
          <button type="submit" disabled={empty || disabled} className="cursor-pointer text-[15px] font-semibold text-[var(--channel-dm-to)] disabled:cursor-default disabled:opacity-40">
            Send
          </button>
        </div>
      </form>
    );
  }

  if (channel === "linkedin") {
    return (
      <form onSubmit={send} className="border-t border-border">
        <textarea {...field} rows={2} className={cx(fieldText, "m-3 block w-[calc(100%-1.5rem)] resize-none rounded-lg bg-subtle px-3 py-2.5")} />
        <div className="flex items-center gap-3 px-3 pb-3 text-muted">
          <Icon name="image" size={20} />
          <Icon name="paperclip" size={20} />
          <button
            type="submit"
            disabled={empty || disabled}
            className="press ml-auto inline-flex h-8 cursor-pointer items-center rounded-full bg-channel-linkedin px-4 text-sm font-semibold text-white disabled:cursor-default disabled:bg-[#d4d4d8] disabled:text-white"
          >
            Send
          </button>
        </div>
      </form>
    );
  }

  if (channel === "chat") {
    return (
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2.5">
        <input {...field} className={cx(fieldText, "min-w-0 flex-1 px-1")} />
        <button
          type="submit"
          aria-label="Send"
          disabled={empty || disabled}
          className="press inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-brand-foreground disabled:cursor-default disabled:opacity-40"
        >
          <Icon name="send" size={17} strokeWidth={2} />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={send} className="m-3 flex flex-col rounded-xl shadow-[0_0_0_1px_var(--border),0_4px_16px_-6px_rgb(0_0_0/0.12)]">
      {initialSubject !== undefined && (
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          aria-label="Subject"
          placeholder="Subject"
          disabled={disabled}
          className={cx(fieldText, "border-b border-border px-3.5 py-2.5 font-medium")}
        />
      )}
      <textarea {...field} rows={3} className={cx(fieldText, "resize-none px-3.5 py-2.5")} />
      <div className="flex items-center gap-3 px-3 pb-3 text-muted">
        <button
          type="submit"
          disabled={empty || disabled}
          className="press inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-channel-email px-4 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-40"
        >
          Send <Icon name="send" size={15} strokeWidth={2} />
        </button>
        <Icon name="paperclip" size={18} />
        <span className="ml-auto hidden text-meta text-faint @md:inline">Ctrl or Cmd and Enter sends</span>
      </div>
    </form>
  );
}
