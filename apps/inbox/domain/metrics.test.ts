import { describe, expect, it } from "vitest";
import { formatDurationShort } from "./metrics";

// The averages on the film fixtures are checked in film/fixtures.test.ts, because domain tests may not import film/.
describe("formatDurationShort", () => {
  it("U5: writes seconds as seconds", () => {
    expect(formatDurationShort(38)).toBe("38 s");
  });

  it("U5: writes whole hours as hours", () => {
    expect(formatDurationShort(32_400)).toBe("9 h");
  });
});
