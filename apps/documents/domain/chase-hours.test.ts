import { describe, expect, it } from "vitest";
import { chasingHoursAfter, chasingHoursBefore, exampleMonth, formatHours } from "./chase-hours";

describe("the example month of decision N3 @documents.film", () => {
  it("gives 12 hours of chasing before and 1 hour of reading after", () => {
    expect(chasingHoursBefore()).toBe(12);
    expect(chasingHoursAfter()).toBe(1);
  });

  it("follows the inputs", () => {
    expect(chasingHoursBefore({ ...exampleMonth, returns: 20 })).toBe(6);
    expect(chasingHoursAfter({ ...exampleMonth, minutesPerSummary: 3 })).toBe(2);
  });

  it("formats hours for the finale", () => {
    expect(formatHours(12)).toBe("12 h");
    expect(formatHours(0.5)).toBe("0.5 h");
  });
});
