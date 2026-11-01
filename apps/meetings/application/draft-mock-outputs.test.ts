import { describe, expect, it } from "vitest";
import { parseTranscript } from "@/domain/transcript";
import { filledSampleCall } from "@/test-support/sample-call";
import { meetingsPreset, teamProfile, testProfile, titledProfile } from "@/test-support/test-profile";
import { draftMockOutputs } from "./draft-mock-outputs";

const localNow = "2026-11-10T14:32:10";
const draft = (transcript: string, profile = meetingsPreset) => draftMockOutputs({ turns: parseTranscript(transcript), profile, localNow });

/** Every sentence the visitor reads in the outputs. */
function prose(outputs: ReturnType<typeof draftMockOutputs>): string {
  return [outputs.summary, outputs.crm.nextStep, outputs.proposal.title, outputs.followUpEmail.subject, outputs.followUpEmail.body].join("\n");
}

const recordedCall = [
  "[00:02] You: Hi Rosa, thanks for taking the call. Tell me how you run your flats today.",
  "[00:09] Prospect: We own 12 flats and spend about 40 hours a month chasing late rent and repairs.",
].join("\n");

describe("draftMockOutputs reads like a careful assistant @meetings.live-sample", () => {
  it("labels each figure with what it counts and skips the year", () => {
    const figures = draft(filledSampleCall(meetingsPreset)).numbers;
    expect(figures.map((figure) => figure.value)).not.toContain("2015");
    expect(figures).toContainEqual({ label: "Average rent a month", value: "1,150" });
    expect(figures.every((figure) => /^[A-Z][a-z]/.test(figure.label))).toBe(true);
  });

  it("takes the company and the email address from the call", () => {
    const { crm, proposal } = draft(filledSampleCall(meetingsPreset));
    expect(crm).toMatchObject({ company: "Becker Residential", contactName: "Tom Becker", email: "tom@becker-residential.example" });
    expect(proposal.title).toBe("Full rental management for Becker Residential");
  });

  it("names a recorded prospect from the seller's greeting, and invents no company", () => {
    const outputs = draft(recordedCall, teamProfile);
    expect(outputs.crm.contactName).toBe("Rosa");
    expect(outputs.crm.company).toBe("Rosa");
    expect(outputs.followUpEmail.body).toMatch(/^Hi Rosa,/);
    expect(outputs.numbers).toEqual([
      { label: "Flats", value: "12" },
      { label: "Hours a month", value: "40" },
    ]);
  });

  it("writes to a new contact when the call never says a name", () => {
    const outputs = draft(recordedCall.replace("Hi Rosa, thanks", "Thanks"), teamProfile);
    expect(outputs.crm.contactName).toBe("New contact");
    expect(outputs.followUpEmail.body).toMatch(/^Hello,/);
    expect(prose(outputs)).not.toMatch(/Prospect's|New contact's/);
  });
});

describe("draftMockOutputs for any profile @meetings.make-it-yours", () => {
  it("signs as the team and names no price when the profile has neither a person nor a price", () => {
    const outputs = draft(filledSampleCall(teamProfile), teamProfile);
    const text = prose(outputs);
    expect(text).not.toMatch(/\bthe team of\b|is Price on request|at Price on request/);
    expect(outputs.followUpEmail.body).toContain("The Harbourline Lettings and Property Services of North London team");
    expect(outputs.crm.dealValue).toBe("Not priced yet");
  });

  it("greets nobody by title and signs with the owner's full name", () => {
    const outputs = draft(filledSampleCall(titledProfile), titledProfile);
    expect(outputs.followUpEmail.body).toMatch(/Dr\. Lena Okafor$/);
    expect(prose(outputs)).not.toMatch(/\bDr\.? (?:from|said)/);
  });

  it("uses the profile's price in the email", () => {
    expect(draft(filledSampleCall(testProfile), testProfile).followUpEmail.body).toContain("at GBP 29 per flat per month");
  });
});
