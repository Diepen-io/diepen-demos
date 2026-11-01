/**
 * Story times and the visitor's clock are wall-clock times without a zone, for example
 * "2026-11-12T09:00". They are read and written as written, so no time zone ever moves them.
 */

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Milliseconds for a wall-clock time, counted as if it were UTC. */
export function wallMs(iso: string): number {
  return Date.parse(`${iso.length === 10 ? `${iso}T00:00` : iso}Z`);
}

/** "2026-11-12T09:00" from milliseconds made by `wallMs`. */
export function wallIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 16);
}

/** Minutes since midnight of "09:30", or of the time in "2026-11-12T09:30". */
export function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = (time.length > 5 ? time.slice(11, 16) : time).split(":").map(Number);
  return hours * 60 + minutes;
}

/** "2026-11-12" plus a number of days. */
export function addDays(date: string, days: number): string {
  return wallIso(wallMs(date) + days * 86_400_000).slice(0, 10);
}

/** 0 for Sunday to 6 for Saturday. */
export function weekdayOf(date: string): number {
  return new Date(wallMs(date.slice(0, 10))).getUTCDay();
}

/** "2026-11-12T09:30" from a date and minutes since midnight. */
export function atMinutes(date: string, minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  return `${date}T${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

/** The names a sentence uses: "Thursday", "12", "November", "09:00". */
export function wallParts(iso: string) {
  const date = new Date(wallMs(iso.slice(0, 16)));
  const weekday = weekdayNames[date.getUTCDay()] ?? "";
  const month = monthNames[date.getUTCMonth()] ?? "";
  return { weekday, day: date.getUTCDate(), month, time: iso.slice(11, 16) };
}
