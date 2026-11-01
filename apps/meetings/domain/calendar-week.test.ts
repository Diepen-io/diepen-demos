import { describe, expect, it } from "vitest";
import { mondayOf, weekLabel, workingDays } from "./calendar-week";

describe("calendar week @meetings.film", () => {
  it("finds the working week of a date, looking ahead from a weekend", () => {
    expect(mondayOf("2026-11-13T10:00:00")).toBe("2026-11-09");
    expect(mondayOf("2026-11-14")).toBe("2026-11-16");
    expect(workingDays("2026-11-09")).toEqual(["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"]);
  });

  it("names the week for the lane header, also across a month", () => {
    expect(weekLabel("2026-11-09")).toBe("9 to 13 November");
    expect(weekLabel("2026-11-30")).toBe("30 November to 4 December");
    expect(weekLabel("2026-12-28")).toBe("28 December to 1 January");
  });
});
