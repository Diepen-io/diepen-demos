import { presetList } from "@diepen/voice/presets";
import type { CompanyProfile } from "@diepen/voice/profile";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { meetingsPreset, testProfile, unpricedProfile } from "@/test-support/test-profile";
import { buildMeetingsKeynote } from "./meetings-keynote";

const profiles: [string, CompanyProfile][] = [
  ...presetList.map((preset): [string, CompanyProfile] => [preset.id, preset]),
  [testProfile.id, testProfile],
  [unpricedProfile.id, unpricedProfile],
];

/** The text a beat puts on screen: its caption, its element and its chip. */
function beatText(beat: ReturnType<typeof buildMeetingsKeynote>["beats"][number]): string {
  return [beat.caption, renderToStaticMarkup(<>{beat.element}</>).replace(/<[^>]+>/g, " "), beat.chip?.label ?? ""].join(" ");
}

// U8, second half
describe("buildMeetingsKeynote fills every token @meetings.make-it-yours", () => {
  it.each(profiles)("leaves no { on screen for %s", (_id, profile) => {
    const film = buildMeetingsKeynote(profile);
    const text = [...film.beats.map(beatText), film.finale.label, film.finale.note].join(" ");
    expect(text).not.toContain("{");
  });
});

// U12
describe("buildMeetingsKeynote @meetings.film", () => {
  const film = buildMeetingsKeynote(meetingsPreset);
  const text = film.beats.map(beatText);

  it("runs the four beats of the plan in order", () => {
    expect(film.beats.map((beat) => beat.caption)).toEqual([
      "The call ends.",
      "The numbers, pulled from the call.",
      "Proposal drafted.",
      "Sent 4 minutes later.",
    ]);
  });

  it("shows the call, his numbers, the proposal at the preset's price and the sent email", () => {
    expect(text[0]).toMatch(/Call with Tom Becker.*Call ended.*32:10/);
    expect(text[1]).toMatch(/Apartments\s+14.*Days empty\s+38.*A week on tenants\s+9 h/);
    expect(text[2]).toContain(meetingsPreset.name);
    expect(text[2]).toContain("for Becker Residential");
    expect(text[2]).toContain("EUR 34 per unit per month");
    expect(text[3]).toContain(`Your proposal from ${meetingsPreset.name}`);
    expect(text[3]).toContain("To Tom Becker");
    expect(film.beats[3]?.chip).toEqual({ label: "Sent 14:36", tone: "pass" });
  });

  it("ends on call end to proposal sent: 2 days before, 4 min after, a fictional company", () => {
    expect(film.finale).toMatchObject({ label: "Call end to proposal sent", before: "2 days", after: "4 min" });
    expect(film.finale.note).toContain(`${meetingsPreset.name}, a fictional company`);
  });
});
