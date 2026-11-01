const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

export type WallDate = { year: number; month: number; day: number; weekday: (typeof weekdays)[number]; monthShort: string; monthLong: string };

/**
 * Reads the date of an ISO string such as "2026-11-12" or "2026-11-12T09:00" as written.
 * Story times in a film are wall-clock times, so they never move with the viewer's time zone.
 */
export function wallDate(iso: string): WallDate {
  const [year = 1970, month = 1, day = 1] = iso.slice(0, 10).split("-").map(Number);
  const weekday = weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? "Mon";
  return { year, month, day, weekday, monthShort: months[month - 1] ?? "", monthLong: monthNames[month - 1] ?? "" };
}

/** "09:00" from "2026-11-12T09:00". */
export function wallTime(iso: string): string {
  return iso.slice(11, 16);
}

/** Minutes since midnight, from the wall-clock time in an ISO string. */
export function wallMinutes(iso: string): number {
  const [hours = 0, minutes = 0] = wallTime(iso).split(":").map(Number);
  return hours * 60 + minutes;
}

/** "Thu 12 Nov, 09:00", the label of an offered slot. */
export function slotLabel(iso: string): string {
  const date = wallDate(iso);
  return `${date.weekday} ${date.day} ${date.monthShort}, ${wallTime(iso)}`;
}
