import { describe, expect, it } from "vitest";
import { slotLabel, wallDate, wallMinutes, wallTime } from "./wall-clock";

describe("wall clock", () => {
  it("reads the time as written, whatever the viewer's time zone", () => {
    expect(wallTime("2026-11-12T09:00")).toBe("09:00");
    expect(wallTime("2026-11-12T23:30:00")).toBe("23:30");
    expect(wallMinutes("2026-11-12T10:30")).toBe(630);
  });

  it("finds the weekday from the date alone", () => {
    expect(wallDate("2026-11-12")).toMatchObject({ weekday: "Thu", day: 12, monthShort: "Nov" });
    expect(wallDate("2026-11-11T16:00").weekday).toBe("Wed");
  });

  it("labels an offered slot", () => {
    expect(slotLabel("2026-11-12T09:00")).toBe("Thu 12 Nov, 09:00");
  });
});
