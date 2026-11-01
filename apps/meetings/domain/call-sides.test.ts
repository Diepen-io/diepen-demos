import { describe, expect, it } from "vitest";
import { meetingsPreset } from "@/test-support/test-profile";
import { identifySides } from "./call-sides";
import type { SpeakerTurn } from "./transcript";

const turn = (speaker: string): SpeakerTurn => ({ speaker, text: "Hello there." });

// U4. The preset's owner is Jonas Albers.
describe("identifySides @meetings.live-paste", () => {
  it("picks the speaker whose name holds the owner's first name as seller, in any case", () => {
    const turns = [turn("Tom Becker"), turn("jonas a."), turn("Tom Becker")];
    expect(identifySides(turns, meetingsPreset)).toEqual({ seller: "jonas a.", prospect: "Tom Becker" });
  });

  it("falls back to the first speaker as seller when no name matches", () => {
    const turns = [turn("Priya Nair"), turn("Rosa Lindqvist")];
    expect(identifySides(turns, meetingsPreset)).toEqual({ seller: "Priya Nair", prospect: "Rosa Lindqvist" });
  });

  it("calls the prospect Prospect when nobody else speaks", () => {
    expect(identifySides([turn("Jonas Albers"), turn("Jonas Albers")], meetingsPreset)).toEqual({
      seller: "Jonas Albers",
      prospect: "Prospect",
    });
  });
});
