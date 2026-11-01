"use client";

import { useEffect, useRef } from "react";

const phoneQuery = "(max-width: 767px)";
/** The live page's bottom padding on a phone (pb-24), which clears the bottom tab bar. */
const pagePaddingPx = 96;
const minHeightPx = 320;

/**
 * Below 768 px, gives the element the height from its top to the bottom tab bar, so the page
 * does not scroll and the composer never ends up under the bar after a reply.
 */
export function usePhoneFit<T extends HTMLElement>(tabBarSelector: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const phone = window.matchMedia(phoneQuery);
    const fit = () => {
      if (!phone.matches) {
        element.style.height = "";
        return;
      }
      const bar = document.querySelector<HTMLElement>(tabBarSelector)?.offsetHeight ?? 0;
      const top = element.getBoundingClientRect().top + window.scrollY;
      const reserve = Math.max(pagePaddingPx, bar + 12);
      element.style.height = `${Math.max(minHeightPx, window.innerHeight - top - reserve)}px`;
    };
    fit();
    const above = new ResizeObserver(fit);
    if (element.parentElement) above.observe(element.parentElement, { box: "border-box" });
    window.addEventListener("resize", fit);
    phone.addEventListener("change", fit);
    return () => {
      above.disconnect();
      window.removeEventListener("resize", fit);
      phone.removeEventListener("change", fit);
    };
  }, [tabBarSelector]);

  return ref;
}
