"use client";

import { useEffect, useRef, useState } from "react";
import { calendarHours } from "@/domain/calendar";
import { minutesOf } from "@/domain/wall-clock";

const dayStart = calendarHours.start * 60;
const hours = Array.from({ length: calendarHours.end - calendarHours.start }, (_, index) => calendarHours.start + index);
/** A 30-minute block is 32 px at this height: room for the time and a name on two lines. */
const minHourPx = 64;
/** Room above the first and below the last hour line, so their labels are not cut. */
const padding = 8;

/** Every hour line, from the opening to the closing hour. */
export const hourLines = [...hours, calendarHours.end];

/**
 * The hour grid of the calendar view: the whole working day when the scroller is tall enough,
 * else a readable hour height and a scroll that centres the start times in `focus`.
 */
export function useHourGrid(focus: readonly string[]) {
  const scroller = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const hourPx = Math.max(minHourPx, (available - padding * 2) / hours.length);
  const focusKey = focus.join(",");

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setAvailable(element.clientHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const starts = focusKey ? focusKey.split(",").map(minutesOf) : [];
    if (starts.length === 0) {
      element.scrollTop = 0;
      return;
    }
    const middle = (Math.min(...starts) + Math.max(...starts) + 30) / 2;
    const centred = ((middle - dayStart) / 60) * hourPx - element.clientHeight / 2;
    // Starts on a whole hour, so the top hour label shows whole.
    element.scrollTop = Math.max(0, Math.round(centred / hourPx) * hourPx);
  }, [hourPx, focusKey]);

  return {
    scroller,
    top: (minutes: number) => padding + ((minutes - dayStart) / 60) * hourPx,
    heightOf: (minutes: number) => (minutes / 60) * hourPx,
    contentHeight: hours.length * hourPx + padding * 2,
  };
}
