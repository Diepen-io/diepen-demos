import { describe, expect, it } from "vitest";
import { elapsedMs, formatDuration } from "./timing-metric";

// U6
describe("timing metric @meetings.film", () => {
  it("measures call end to proposal sent in the film as 4 minutes", () => {
    const ms = elapsedMs("2026-11-10T14:32:10", "2026-11-10T14:36:10");
    expect(ms).toBe(240_000);
    expect(formatDuration(ms)).toBe("4 minutes");
  });

  it("formats days, minutes with seconds, and seconds", () => {
    expect(formatDuration(172_800_000)).toBe("2 days");
    expect(formatDuration(72_000)).toBe("1 min 12 s");
    expect(formatDuration(45_000)).toBe("45 seconds");
  });
});
