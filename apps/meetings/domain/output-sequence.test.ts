import { describe, expect, it } from "vitest";
import { laneOf, outputSequence, revealPlan } from "./output-sequence";

// U5
describe("output sequence @meetings.live-sample", () => {
  it("reveals summary, numbers, crm, proposal, email, meeting", () => {
    expect(outputSequence).toEqual(["summary", "numbers", "crm", "proposal", "email", "meeting"]);
  });

  it("puts each output in its tool lane", () => {
    expect(outputSequence.map(laneOf)).toEqual(["ai", "ai", "crm", "proposal", "proposal", "calendar"]);
  });

  it("spaces the reveal 700 ms apart, and shows all at once with reduced motion", () => {
    expect(revealPlan(700, false)).toEqual([0, 700, 1400, 2100, 2800, 3500]);
    expect(revealPlan(700, true)).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
