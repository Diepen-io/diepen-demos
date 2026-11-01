import { parseStoryTime, storyTimeAt } from "@diepen/ui/film/film-script";
import { defaultPresetFor, presetList, presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { frameAt } from "./film-state";
import { buildInboxFilm } from "./inbox-film";

const profile = defaultPresetFor("inbox");
const script = buildInboxFilm(profile);
const partyIds = ["ana", "priya", "tom", "daniel", "calendar", "owner"];

describe("buildInboxFilm", () => {
  it("U6: has six parties, the four customers first", () => {
    expect(script.parties.map((party) => party.id)).toEqual(partyIds);
  });

  it("U6: tells the night in 5 to 7 beats, each with a highlight, and lasts 45 to 70 seconds", () => {
    expect(script.beats.length).toBeGreaterThanOrEqual(5);
    expect(script.beats.length).toBeLessThanOrEqual(7);
    for (const beat of script.beats) expect(beat.highlight, beat.id).toBeTruthy();
    expect(script.durationMs).toBeGreaterThanOrEqual(45_000);
    expect(script.durationMs).toBeLessThanOrEqual(70_000);
  });

  it("U6: story time never goes down, and every beat's panels show the clock's time", () => {
    script.clock.forEach((frame, index) => {
      const previous = script.clock[index - 1];
      if (previous) expect(parseStoryTime(frame.time)).toBeGreaterThanOrEqual(parseStoryTime(previous.time));
    });
    for (const beat of script.beats) expect(storyTimeAt(script, beat.at)).toBe(parseStoryTime(beat.data.story));
  });

  it("U6: every focus, partner and touched party is one of the six", () => {
    for (const beat of script.beats) {
      for (const party of [beat.focus, beat.partner, ...(beat.touches ?? [])]) {
        if (party) expect(partyIds).toContain(party);
      }
    }
  });

  it("U6: all four channels appear and one conversation is handed to a person", () => {
    const last = script.beats.at(-1);
    const end = frameAt(last?.data.story ?? "", profile.knowledge.bookingMinutes);

    expect(new Set(end.ownerRows.map((row) => row.channel))).toEqual(new Set(["email", "instagram", "linkedin", "chat"]));
    expect(end.ownerRows.some((row) => row.status === "needs_human")).toBe(true);
  });

  it("U6: the end card numbers come from the fixtures", () => {
    expect(script.end.metric).toBe("Reply time");
    expect(script.end.before).toBe("9 hours");
    expect(script.end.after).toBe("38 seconds");
  });

  it.each(presetList.map((preset) => [preset.name, preset] as const))(
    "U7: every caption filled for %s has at most 8 words and no em or en dash",
    (_name, preset) => {
      for (const { caption } of buildInboxFilm(preset).beats) {
        expect(caption.split(/\s+/).length, caption).toBeLessThanOrEqual(8);
        expect(caption).not.toMatch(/[–—{}]/);
      }
    },
  );

  it("U10: a film built for another company holds no name or price of the default preset", () => {
    const other = JSON.stringify(buildInboxFilm(presets["brickfern-property"]));
    const forbidden = [
      profile.name,
      profile.people.owner.name,
      profile.people.assistantName,
      ...profile.knowledge.services.flatMap((service) => (service.price ? [service.price] : [])),
    ];

    for (const literal of forbidden) expect(other, `film holds "${literal}"`).not.toContain(literal);
  });
});
