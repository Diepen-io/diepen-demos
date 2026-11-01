/**
 * Story times are wall-clock times without a zone, for example "2026-03-09T12:40". They are
 * computed as if they were UTC, so they read the same on the server and in every browser.
 */

const storyTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const dayMs = 24 * 60 * 60 * 1000;

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function isStoryTime(value: string): boolean {
  return storyTimePattern.test(value);
}

export function storyTimeToMs(time: string): number {
  return Date.parse(`${time.slice(0, 16)}:00Z`);
}

/** Minute precision, no offset: "2026-03-12T12:50". */
export function storyTimeFromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 16);
}

export function addDays(time: string, days: number): string {
  return storyTimeFromMs(storyTimeToMs(time) + days * dayMs);
}

/** The same time on the first day from Monday to Friday, `time` itself when it already is one. */
export function onWorkingDay(time: string): string {
  const weekday = new Date(storyTimeToMs(time)).getUTCDay();
  return weekday === 6 ? addDays(time, 2) : weekday === 0 ? addDays(time, 1) : time;
}

/** `days` later, moved past a weekend: a firm chases and calls on working days. */
export function addWorkingDays(time: string, days: number): string {
  return onWorkingDay(addDays(time, days));
}

export function isBefore(a: string, b: string): boolean {
  return storyTimeToMs(a) < storyTimeToMs(b);
}

/** "Mon 9 Mar, 12:40". */
export function formatStoryTime(time: string): string {
  const date = new Date(storyTimeToMs(time));
  return `${weekdays[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]}, ${time.slice(11, 16)}`;
}

/** "31 March 2026", for due dates in emails. */
export function formatLongDate(time: string): string {
  const date = new Date(storyTimeToMs(time.length === 10 ? `${time}T00:00` : time));
  return `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "Mon 09:00", as an inbox lists mail across days. */
export function formatWeekdayTime(time: string): string {
  return `${weekdays[new Date(storyTimeToMs(time)).getUTCDay()]} ${time.slice(11, 16)}`;
}
