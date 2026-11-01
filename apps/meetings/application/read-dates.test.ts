import { describe, expect, it } from "vitest";
import { parseTranscript } from "@/domain/transcript";
import { agreedMeetingStart, agreedStart } from "./read-dates";

const turns = (...lines: string[]) => parseTranscript(lines.map((line, index) => `[00:0${index}] Tom: ${line}`).join("\n"));
const tuesday = "2026-11-10T14:32:10";

describe("dates the call agrees on @meetings.live-sample", () => {
  it("books the named weekday at the named time, after today", () => {
    expect(agreedMeetingStart(turns("Does Friday at ten work?", "Friday at ten works."), tuesday)).toBe("2026-11-13T10:00:00");
    expect(agreedMeetingStart(turns("Tuesday at 3 works."), tuesday)).toBe("2026-11-17T15:00:00");
    expect(agreedMeetingStart(turns("Monday at 9:30 am then."), tuesday)).toBe("2026-11-16T09:30:00");
  });

  it("returns null when the call names no weekday with a time", () => {
    expect(agreedMeetingStart(turns("Let's talk next week."), tuesday)).toBeNull();
  });

  it("reads a start date said as a day of a month", () => {
    expect(agreedStart(turns("The first of January, clean start."))).toBe("Start on 1 January");
    expect(agreedStart(turns("From the 15th of March would suit us."))).toBe("Start on 15 March");
    expect(agreedStart(turns("January would be ideal."))).toBeNull();
  });
});
