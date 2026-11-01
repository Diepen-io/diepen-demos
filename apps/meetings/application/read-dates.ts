import type { SpeakerTurn } from "@/domain/transcript";

/** The meeting and start dates a call agrees on, read by the keyless mock with plain text rules. */

const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const numberWords = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const ordinalWords = [
  "", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
  "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth",
  "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth", "twenty-ninth", "thirtieth", "thirty-first",
];

const weekdayAt = new RegExp(
  `\\b(${weekdays.join("|")})\\s+at\\s+(\\d{1,2}|${numberWords.slice(1).join("|")})(?::(\\d{2}))?\\s*(am|pm|a\\.m\\.|p\\.m\\.)?`,
  "i",
);
const dayOfMonth = new RegExp(`\\b(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+of\\s+(${months.join("|")})\\b|\\b(?:the\\s+)?(${ordinalWords.slice(1).join("|")})\\s+of\\s+(${months.join("|")})\\b`, "i");

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** A spoken hour as a 24-hour clock hour. Without am or pm, 1 to 7 is the afternoon: meetings happen in office hours. */
function clockHour(spoken: string, suffix: string | undefined): number | null {
  const named = numberWords.indexOf(spoken.toLowerCase());
  const hour = named > 0 ? named : Number(spoken);
  if (!Number.isInteger(hour) || hour < 1 || hour > 23) return null;
  const pm = suffix?.toLowerCase().startsWith("p");
  if (pm && hour < 12) return hour + 12;
  if (suffix?.toLowerCase().startsWith("a")) return hour === 12 ? 0 : hour;
  return hour < 8 ? hour + 12 : hour;
}

/**
 * The last "Friday at ten" the call names, on the first such weekday after `localNow`, as a
 * wall-clock ISO time. `null` when the call names no weekday with a time.
 */
export function agreedMeetingStart(turns: readonly SpeakerTurn[], localNow: string): string | null {
  for (const turn of [...turns].reverse()) {
    const match = weekdayAt.exec(turn.text);
    if (!match?.[1] || !match[2]) continue;
    const hour = clockHour(match[2], match[4]);
    if (hour === null) continue;
    const day = new Date(`${localNow.slice(0, 10)}T00:00:00Z`);
    const target = weekdays.indexOf(match[1].toLowerCase());
    do day.setUTCDate(day.getUTCDate() + 1);
    while (day.getUTCDay() !== target);
    return `${day.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:${match[3] ?? "00"}:00`;
  }
  return null;
}

/** "Start on 1 January" when the call names a day of a month, else `null`. */
export function agreedStart(turns: readonly SpeakerTurn[]): string | null {
  for (const turn of [...turns].reverse()) {
    const match = dayOfMonth.exec(turn.text);
    if (!match) continue;
    const day = match[1] ? Number(match[1]) : ordinalWords.indexOf((match[3] ?? "").toLowerCase());
    const month = match[2] ?? match[4];
    if (day >= 1 && day <= 31 && month) return `Start on ${day} ${capitalise(month)}`;
  }
  return null;
}
