"use client";

import { useRef, type KeyboardEvent } from "react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { channelLooks, channelOrder, type ChannelId } from "./channel-looks";

export type ChannelTabsProps = {
  value: ChannelId;
  onChange?: (channel: ChannelId) => void;
  /** Channels with a reply the visitor has not seen get a dot. */
  unread?: Partial<Record<ChannelId, boolean>>;
  channels?: readonly ChannelId[];
  /** The id of the panel the tabs control, for screen readers. */
  panelId?: string;
  className?: string;
};

/** Switches between customer channels. Without `onChange` it only shows which one is active, as in the film. */
export function ChannelTabs({ value, onChange, unread = {}, channels = channelOrder, panelId, className }: ChannelTabsProps) {
  const list = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = channels.indexOf(value);
    const next = channels[(index + (event.key === "ArrowRight" ? 1 : -1) + channels.length) % channels.length];
    if (!next || !onChange) return;
    event.preventDefault();
    onChange(next);
    list.current?.querySelector<HTMLElement>(`[data-channel="${next}"]`)?.focus();
  }

  return (
    <div
      ref={list}
      role="tablist"
      aria-label="Channels"
      onKeyDown={onKeyDown}
      className={cx("scroll-area flex gap-1 overflow-x-auto rounded-xl bg-subtle p-1 shadow-[inset_0_0_0_1px_var(--border)]", className)}
    >
      {channels.map((channel) => {
        const look = channelLooks[channel];
        const active = channel === value;
        return (
          <button
            key={channel}
            type="button"
            role="tab"
            data-channel={channel}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(channel)}
            className={cx(
              "relative inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-body font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-200",
              onChange ? "cursor-pointer" : "cursor-default",
              active ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.06)]" : "text-muted hover:text-foreground",
            )}
          >
            <span className="inline-flex size-5 items-center justify-center rounded-[5px] text-white" style={{ backgroundColor: look.accent }}>
              <Icon name={look.icon} size={12} strokeWidth={2.25} />
            </span>
            {look.label}
            {unread[channel] && !active && (
              <span className="enter size-2 rounded-full bg-channel-email" aria-label="New reply" role="img" />
            )}
          </button>
        );
      })}
    </div>
  );
}
