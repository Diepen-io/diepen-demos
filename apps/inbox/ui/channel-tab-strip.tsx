"use client";

import { ChannelTabs, type ChannelTabsProps } from "@diepen/ui/mockups/channel-tabs";
import { cx } from "@diepen/ui/primitives/class-names";
import { useEffect, useRef, useState } from "react";

type Overflow = { before: boolean; after: boolean };

/**
 * The channel tabs, with the active tab kept in view. On a phone the strip scrolls sideways; a fade
 * at an edge shows that more tabs wait there.
 */
export function ChannelTabStrip(props: ChannelTabsProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<Overflow>({ before: false, after: false });

  useEffect(() => {
    const strip = wrapper.current?.querySelector<HTMLElement>('[role="tablist"]');
    const tab = strip?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!strip || !tab) return;
    const left = tab.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
    const right = left + tab.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollLeft = left - 4;
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth + 4;
  }, [props.value]);

  useEffect(() => {
    const strip = wrapper.current?.querySelector<HTMLElement>('[role="tablist"]');
    if (!strip) return;
    const measure = () =>
      setOverflow({ before: strip.scrollLeft > 1, after: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1 });
    measure();
    strip.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => {
      strip.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  const fade = "pointer-events-none absolute inset-y-px w-10 from-subtle to-transparent transition-opacity duration-200";
  return (
    <div ref={wrapper} className="relative min-w-0">
      <ChannelTabs {...props} />
      <span aria-hidden="true" className={cx(fade, "left-px rounded-l-xl bg-linear-to-r", overflow.before ? "opacity-100" : "opacity-0")} />
      <span aria-hidden="true" className={cx(fade, "right-px rounded-r-xl bg-linear-to-l", overflow.after ? "opacity-100" : "opacity-0")} />
    </div>
  );
}
