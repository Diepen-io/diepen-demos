/** The working week a meeting falls in. Dates are wall-clock ISO dates such as "2026-11-09". */

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The Monday of the working week an ISO date falls in. A weekend looks ahead to the next week. */
export function mondayOf(iso: string): string {
  const day = new Date(`${iso.slice(0, 10)}T00:00:00Z`).getUTCDay();
  return addDays(iso, day === 0 ? 1 : day === 6 ? 2 : 1 - day);
}

/** The five working days from a Monday. */
export function workingDays(weekStart: string): string[] {
  return Array.from({ length: 5 }, (_, index) => addDays(weekStart, index));
}

/** "9 to 13 November", or "30 November to 4 December" across a month. Short enough for a lane header. */
export function weekLabel(weekStart: string): string {
  const first = new Date(`${weekStart}T00:00:00Z`);
  const last = new Date(`${addDays(weekStart, 4)}T00:00:00Z`);
  const lastPart = `${last.getUTCDate()} ${months[last.getUTCMonth()]}`;
  if (first.getUTCMonth() === last.getUTCMonth()) return `${first.getUTCDate()} to ${lastPart}`;
  return `${first.getUTCDate()} ${months[first.getUTCMonth()]} to ${lastPart}`;
}
