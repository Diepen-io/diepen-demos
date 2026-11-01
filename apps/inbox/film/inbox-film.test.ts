import { parseStoryTime } from "@diepen/ui/film/film-script";
import { defaultPresetFor, presetList, presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { snapshotAt } from "./film-state";
import { buildInboxFilm } from "./inbox-film";

const laneIds = ["customers", "ai", "calendar", "owner"];
const profile = defaultPresetFor("inbox");
const script = buildInboxFilm(profile);

describe("buildInboxFilm", () => {
  it("U6: has the four lanes of the plan", () => {
    expect(script.lanes.map((lane) => lane.id)).toEqual(laneIds);
  });

  it("U6: sorts beats by film time", () => {
    script.beats.forEach((beat, index) => {
      const previous = script.beats[index - 1];
      if (previous) expect(beat.at).toBeGreaterThanOrEqual(previous.at);
    });
  });

  it("U6: story time never goes down", () => {
    script.clock.forEach((frame, index) => {
      const previous = script.clock[index - 1];
      if (!previous) return;
      expect(frame.at).toBeGreaterThanOrEqual(previous.at);
      expect(parseStoryTime(frame.time)).toBeGreaterThanOrEqual(parseStoryTime(previous.time));
    });
  });

  it("U6: the last beat starts between 60 and 90 seconds", () => {
    const last = script.beats.at(-1);

    expect(last?.at).toBeGreaterThanOrEqual(60_000);
    expect(last?.at).toBeLessThanOrEqual(90_000);
    expect(script.durationMs).toBeLessThanOrEqual(90_000);
  });

  it("U6: every beat lane and travel start is one of the four lanes", () => {
    for (const beat of script.beats) {
      expect(laneIds).toContain(beat.lane);
      if (beat.travel) expect(laneIds).toContain(beat.travel.from);
    }
  });

  it("U6: all four channels appear and one conversation is handed to a person", () => {
    const end = snapshotAt(script.end.at, profile);

    expect(new Set(end.ownerRows.map((row) => row.channel))).toEqual(new Set(["email", "instagram", "linkedin", "chat"]));
    expect(end.ownerRows.some((row) => row.status === "needs_human")).toBe(true);
  });

  it("U6: the end card has a metric, a before and an after number", () => {
    expect(script.end.metric).not.toBe("");
    expect(script.end.before).toBe("9 hours");
    expect(script.end.after).toBe("38 seconds");
  });

  it.each(presetList.map((preset) => [preset.name, preset] as const))(
    "U7: every caption filled for %s is at most 60 characters and has no em or en dash",
    (_name, preset) => {
      const captions = buildInboxFilm(preset).beats.flatMap((beat) => (beat.caption ? [beat.caption] : []));

      expect(captions.length).toBeGreaterThan(10);
      for (const caption of captions) {
        expect(caption.length, caption).toBeLessThanOrEqual(60);
        expect(caption).not.toMatch(/[–—]/);
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
