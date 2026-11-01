"use client";

import { ChannelTabs, type ChannelTabsProps } from "@diepen/ui/mockups/channel-tabs";
import { useEffect, useRef } from "react";

/**
 * The channel tabs, with the active tab kept in view. On a phone the strip scrolls sideways, and
 * "Website chat", the last tab, would otherwise start out of sight.
 */
export function ChannelTabStrip(props: ChannelTabsProps) {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = wrapper.current?.querySelector<HTMLElement>('[role="tablist"]');
    const tab = strip?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!strip || !tab) return;
    const left = tab.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
    const right = left + tab.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollLeft = left - 4;
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth + 4;
  }, [props.value]);

  return (
    <div ref={wrapper} className="min-w-0">
      <ChannelTabs {...props} />
    </div>
  );
}
