import { describe, expect, it } from "vitest";
import { teamProfile, testProfile, titledProfile } from "@/test-support/test-profile";
import { identifySides } from "./call-sides";
import { sellerOf } from "./seller";
import { parseTranscript } from "./transcript";
import { filledSampleCall } from "@/test-support/sample-call";

describe("sellerOf @meetings.make-it-yours", () => {
  it("names a person by first name without a title", () => {
    expect(sellerOf(titledProfile)).toMatchObject({ short: "Lena", speaker: "Dr. Lena Okafor", intro: "Lena from Harbourline Lettings" });
  });

  it("speaks as the company when the profile names the team", () => {
    expect(sellerOf(teamProfile)).toMatchObject({
      person: null,
      short: "You",
      speaker: "Harbourline Lettings and Property",
      intro: "the team at Harbourline Lettings and Property Services of North London",
      signature: "The Harbourline Lettings and Property Services of North London team",
    });
  });

  it("fills the sample call so it reads well and still parses into 36 turns with the seller found", () => {
    for (const profile of [testProfile, titledProfile, teamProfile]) {
      const call = filledSampleCall(profile);
      const turns = parseTranscript(call);
      expect(turns).toHaveLength(36);
      expect(identifySides(turns, profile).prospect).toBe("Tom Becker");
      expect(call).not.toMatch(/it's the from|it's Dr\.|is Price on request/);
    }
  });

  it("finds a recorded seller labelled You", () => {
    const turns = parseTranscript("Prospect: Hello there.\nYou: Hi, thanks for the time.");
    expect(identifySides(turns, teamProfile)).toEqual({ seller: "You", prospect: "Prospect" });
  });
});
