import { parseStoryTime, storyTimeAt } from "@diepen/ui/film/film-script";
import { presetList } from "@diepen/voice/presets";
import type { CompanyProfile } from "@diepen/voice/profile";
import { describe, expect, it } from "vitest";
import { meetingsPreset, testProfile, unpricedProfile } from "@/test-support/test-profile";
import { buildMeetingsFilm } from "./meetings-film";

const laneIds = ["call", "ai", "crm", "proposal", "calendar"];
const profiles: [string, CompanyProfile][] = [
  ...presetList.map((preset): [string, CompanyProfile] => [preset.id, preset]),
  [testProfile.id, testProfile],
  [unpricedProfile.id, unpricedProfile],
];

/** Every string in a value, however deep. */
function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

// U8, second half
describe("buildMeetingsFilm fills every token @meetings.make-it-yours", () => {
  it.each(profiles)("leaves no { in any caption, line or output for %s", (_id, profile) => {
    const leftovers = stringsIn(buildMeetingsFilm(profile)).filter((text) => text.includes("{"));
    expect(leftovers).toEqual([]);
  });
});

// U12
describe("buildMeetingsFilm @meetings.film", () => {
  const film = buildMeetingsFilm(meetingsPreset);

  it("has the five lanes", () => {
    expect(film.lanes.map((lane) => lane.id)).toEqual(laneIds);
  });

  it("sorts beats by film time, and every lane and travel end is one of the five lanes", () => {
    const times = film.beats.map((beat) => beat.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    for (const beat of film.beats) {
      expect(laneIds).toContain(beat.lane);
      if (beat.travel) expect(laneIds).toContain(beat.travel.from);
    }
  });

  it("moves the clock forward only", () => {
    film.clock.forEach((frame, index) => {
      const previous = film.clock[index - 1];
      if (!previous) return;
      expect(frame.at).toBeGreaterThan(previous.at);
      expect(parseStoryTime(frame.time)).toBeGreaterThanOrEqual(parseStoryTime(previous.time));
    });
  });

  it("shows the story clock of the beat table", () => {
    const clockAt = (ms: number) => new Date(storyTimeAt(film, ms)).toISOString().slice(11, 19);
    expect(clockAt(0)).toBe("14:00:00");
    expect(clockAt(31_000)).toBe("14:32:10");
    expect(clockAt(49_000)).toBe("14:33:50");
    expect(clockAt(63_000)).toBe("14:36:10");
  });

  it("ends with the end card at 67,000 and the film at 80,000", () => {
    expect(film.durationMs).toBe(80_000);
    expect(film.end.at).toBe(67_000);
    expect(film.beats.at(-1)?.at ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(67_000);
  });

  it("puts call end to proposal sent on the end card: 2 days before, 4 minutes after", () => {
    expect(film.end).toMatchObject({ metric: "Call end to proposal sent", before: "2 days", after: "4 minutes" });
    expect(film.end.note).toMatch(/fictional/i);
  });

  it.each(profiles)("keeps every caption for %s to 60 characters without em or en dashes", (_id, profile) => {
    for (const beat of buildMeetingsFilm(profile).beats) {
      if (!beat.caption) continue;
      expect(beat.caption.length, beat.caption).toBeLessThanOrEqual(60);
      expect(beat.caption).not.toMatch(/[–—]/);
    }
  });
});
