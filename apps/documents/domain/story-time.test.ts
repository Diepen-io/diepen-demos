import { describe, expect, it } from "vitest";
import { addWorkingDays, onWorkingDay } from "./story-time";

describe("working days @documents.chase", () => {
  it("moves a Saturday or Sunday to Monday at the same time", () => {
    expect(onWorkingDay("2026-03-14T12:40")).toBe("2026-03-16T12:40");
    expect(onWorkingDay("2026-03-15T12:40")).toBe("2026-03-16T12:40");
    expect(onWorkingDay("2026-03-12T12:40")).toBe("2026-03-12T12:40");
  });

  it("adds days and then skips the weekend", () => {
    expect(addWorkingDays("2026-03-09T12:40", 3)).toBe("2026-03-12T12:40");
    expect(addWorkingDays("2026-03-12T12:40", 3)).toBe("2026-03-16T12:40");
  });
});
