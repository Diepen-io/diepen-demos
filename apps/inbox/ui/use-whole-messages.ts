"use client";

import { useEffect, useRef } from "react";

/** Space left above the first whole message. */
const gap = 8;

/**
 * Film frames show whole messages. The channel mockups scroll a thread to its end, which can cut
 * the top message in half; this moves the scroll to the first message that fits whole and adds
 * the missing room under the newest one. The newest message stays fully in view.
 */
export function useWholeMessages<T extends HTMLElement>(latest: string) {
  const root = useRef<T>(null);

  useEffect(() => {
    const scroller = threadScroller(root.current);
    if (!scroller) return;
    const align = () => alignToWholeMessage(scroller);
    align();
    // The border box ignores the padding this sets, so the observer does not trigger itself.
    const observer = new ResizeObserver(align);
    observer.observe(scroller, { box: "border-box" });
    return () => observer.disconnect();
  }, [latest]);

  return root;
}

/** The visible list that scrolls: the open thread, not a hidden inbox list. */
function threadScroller(root: HTMLElement | null): HTMLElement | undefined {
  if (!root) return undefined;
  return [...root.querySelectorAll<HTMLElement>(".scroll-area")].filter((element) => element.clientHeight > 0).at(-1);
}

function alignToWholeMessage(scroller: HTMLElement) {
  scroller.style.paddingBottom = "";
  const overflow = scroller.scrollHeight - scroller.clientHeight;
  if (overflow <= 0) return;
  const emails = scroller.querySelectorAll<HTMLElement>("[data-email-message]");
  const blocks = emails.length > 0 ? [...emails] : [...scroller.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
  const origin = scroller.getBoundingClientRect().top - scroller.scrollTop;
  const firstWhole = blocks.map((block) => block.getBoundingClientRect().top - origin).find((top) => top - gap >= overflow - 1);
  if (firstWhole === undefined) return;
  const target = firstWhole - gap;
  const basePadding = Number.parseFloat(getComputedStyle(scroller).paddingBottom) || 0;
  scroller.style.paddingBottom = `${basePadding + Math.max(0, target - overflow)}px`;
  scroller.scrollTop = target;
}
