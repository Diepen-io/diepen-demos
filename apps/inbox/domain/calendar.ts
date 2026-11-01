import { addDays, atMinutes, minutesOf, wallParts, weekdayOf } from "./wall-clock";

/**
 * The simulated calendar both modes share (decision I1): the default preset's working hours for
 * every profile, and a busy pattern that repeats by weekday.
 */

type Span = readonly [from: string, to: string];

/** Monday to Thursday 08:00 to 18:00, Friday 08:00 to 14:00, closed at the weekend. */
const workingHours: Partial<Record<number, Span>> = {
  1: ["08:00", "18:00"],
  2: ["08:00", "18:00"],
  3: ["08:00", "18:00"],
  4: ["08:00", "18:00"],
  5: ["08:00", "14:00"],
};

// Monday and Tuesday borrow Wednesday's blocks, so every working day has some appointments.
const wednesdayBusy: readonly Span[] = [["08:00", "12:30"], ["14:00", "15:30"]];
const busyByWeekday: Partial<Record<number, readonly Span[]>> = {
  1: wednesdayBusy,
  2: wednesdayBusy,
  3: wednesdayBusy,
  4: [["08:00", "09:00"], ["09:30", "10:30"], ["11:00", "13:00"]],
  5: [["08:00", "10:30"], ["12:00", "14:00"]],
};

/** The hours a calendar view draws. */
export const calendarHours = { start: 8, end: 18 } as const;

const slotStepMinutes = 30;
const daysOffered = 3;

export type TimeBlock = { start: string; end: string };

/** The next working days after the day of `now`, as "2026-11-11". */
export function workingDaysAfter(now: string, count = daysOffered): string[] {
  const days: string[] = [];
  let day = now.slice(0, 10);
  while (days.length < count) {
    day = addDays(day, 1);
    if (workingHours[weekdayOf(day)]) days.push(day);
  }
  return days;
}

/** Appointments that were in the calendar before the story starts. */
export function busyBlocks(date: string): TimeBlock[] {
  return (busyByWeekday[weekdayOf(date)] ?? []).map(([from, to]) => ({
    start: `${date}T${from}`,
    end: `${date}T${to}`,
  }));
}

/** Where a slot of `minutes` that starts at `slot` ends. */
export function slotEnd(slot: string, minutes: number): string {
  return atMinutes(slot.slice(0, 10), minutesOf(slot) + minutes);
}

/**
 * Every free slot of `minutes` in the next three working days after `now`. Slots start on the
 * hour or half hour and overlap no busy block and no booking.
 */
export function freeSlots(now: string, bookings: readonly string[], minutes: number): string[] {
  const slots: string[] = [];
  for (const day of workingDaysAfter(now)) {
    const hours = workingHours[weekdayOf(day)];
    if (!hours) continue;
    const taken = [
      ...busyBlocks(day),
      ...bookings.filter((booking) => booking.startsWith(day)).map((start) => ({ start, end: slotEnd(start, minutes) })),
    ].map((block) => [minutesOf(block.start), minutesOf(block.end)] as const);
    for (let start = minutesOf(hours[0]); start + minutes <= minutesOf(hours[1]); start += slotStepMinutes) {
      const end = start + minutes;
      if (taken.every(([from, to]) => end <= from || start >= to)) slots.push(atMinutes(day, start));
    }
  }
  return slots;
}

/** A slot the way a reply says it: "Thursday 12 November at 09:00". */
export function formatSlot(slot: string): string {
  const { weekday, day, month, time } = wallParts(slot);
  return `${weekday} ${day} ${month} at ${time}`;
}

/** A slot the way a chip shows it: "Thu 12 Nov, 09:00". */
export function formatSlotChip(slot: string): string {
  const { weekday, day, month, time } = wallParts(slot);
  return `${weekday.slice(0, 3)} ${day} ${month.slice(0, 3)}, ${time}`;
}

/**
 * Two times worth choosing between: the first free slot and the first free slot on a later day.
 * Without a later day, the second starts at least two hours after the first, so an offer is
 * never two slots back to back.
 */
export function spreadSlots(free: readonly string[]): string[] {
  const [first] = free;
  if (!first) return [];
  const day = first.slice(0, 10);
  const second =
    free.find((slot) => slot.slice(0, 10) > day) ??
    free.find((slot) => slot.startsWith(day) && minutesOf(slot) - minutesOf(first) >= 120);
  return second ? [first, second] : [first];
}
