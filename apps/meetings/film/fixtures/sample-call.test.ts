import { describe, expect, it } from "vitest";
import { parseTranscript } from "@/domain/transcript";
import { filledSampleCall } from "@/test-support/sample-call";
import { meetingsPreset } from "@/test-support/test-profile";
import { sampleCall, sampleCallEndsAt } from "./sample-call";

// U1
describe("the sample call parses @meetings.live-paste", () => {
  const turns = parseTranscript(filledSampleCall(meetingsPreset));

  it("has 36 turns between exactly two speakers", () => {
    expect(turns).toHaveLength(36);
    expect(new Set(turns.map((turn) => turn.speaker))).toEqual(new Set(["Jonas Albers", "Tom Becker"]));
  });

  it("starts at 0 s and has its last line at 31:58", () => {
    expect(turns[0]?.atSeconds).toBe(0);
    expect(turns.at(-1)?.atSeconds).toBe(1918);
  });
});

// U13, second half
describe("the sample call fixture @meetings.film", () => {
  it("has 25 to 40 lines", () => {
    const lines = sampleCall.split("\n").filter((line) => line.trim() !== "");
    expect(lines.length).toBeGreaterThanOrEqual(25);
    expect(lines.length).toBeLessThanOrEqual(40);
  });

  it("ends at 14:32:10 story time", () => {
    expect(sampleCallEndsAt).toBe("2026-11-10T14:32:10");
  });
});
