import { describe, expect, it } from "vitest";
import { formatDuration } from "./metrics";

// The averages on the film fixtures are checked in film/fixtures.test.ts, because domain tests may not import film/.
describe("formatDuration", () => {
  it("U5: writes seconds as seconds", () => {
    expect(formatDuration(38)).toBe("38 seconds");
  });

  it("U5: writes whole hours as hours", () => {
    expect(formatDuration(32_400)).toBe("9 hours");
  });
});
