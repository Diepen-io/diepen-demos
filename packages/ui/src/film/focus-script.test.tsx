import { describe, expect, it } from "vitest";
import { storyTimeAt, parseStoryTime } from "./film-script";
import {
  activeBeat,
  clockForBeats,
  defineFocusFilm,
  partiesOnScreen,
  partiesWithNews,
  partyHistory,
  type FocusFilmScript,
} from "./focus-script";

const base: FocusFilmScript<null> = {
  id: "test",
  title: "Test film",
  durationMs: 20_000,
  parties: [
    { id: "maya", label: "Maya", role: "Email" },
    { id: "calendar", label: "Calendar", role: "Bookings" },
    { id: "owner", label: "Owner", role: "Owner", brand: true },
  ],
  clock: [{ at: 0, time: "2026-03-03T21:47" }],
  beats: [
    { id: "book", at: 5000, focus: "calendar", partner: "maya", caption: "Booked for Thursday", highlight: "booking", data: null },
    { id: "ask", at: 0, focus: "maya", caption: "Maya writes at night", touches: ["owner"], data: null },
    { id: "morning", at: 10_000, focus: "owner", caption: "Every conversation in one list", data: null },
  ],
  end: { at: 15_000, metric: "Reply time", before: "9 hours", after: "38 seconds" },
};

const script = defineFocusFilm(base);
const [, ask] = base.beats as [FocusFilmScript<null>["beats"][number], FocusFilmScript<null>["beats"][number]];

describe("defineFocusFilm", () => {
  it("sorts beats by film time", () => {
    expect(script.beats.map((beat) => beat.id)).toEqual(["ask", "book", "morning"]);
  });

  it.each([
    ["an unknown focus", { ...base, beats: [{ ...ask, focus: "nobody" }] }, /unknown party "nobody"/],
    ["a partner equal to the focus", { ...base, beats: [{ ...ask, partner: "maya" }] }, /same party/],
    ["a caption over the word limit", { ...base, beats: [{ ...ask, caption: "one two three four five six seven eight nine ten" }] }, /10 words/],
    ["a caption with an em dash", { ...base, beats: [{ ...ask, caption: "Maya writes — late" }] }, /dash/],
    ["no beat at 0", { ...base, beats: [base.beats[0]] }, /first beat starts at 0/],
    ["too many beats", { ...base, beats: Array.from({ length: 9 }, (_, index) => ({ ...ask, id: `b${index}`, at: index * 1000 })) }, /at most 8/],
  ])("rejects %s", (_name, broken, message) => {
    expect(() => defineFocusFilm(broken as FocusFilmScript<null>)).toThrow(message);
  });
});

describe("activeBeat", () => {
  it("is the latest beat that started", () => {
    expect(activeBeat(script, 0).id).toBe("ask");
    expect(activeBeat(script, 4999).id).toBe("ask");
    expect(activeBeat(script, 5000).id).toBe("book");
    expect(activeBeat(script, 19_000).id).toBe("morning");
  });

  it("lists the focus first, then the partner", () => {
    expect(partiesOnScreen(activeBeat(script, 6000))).toEqual(["calendar", "maya"]);
  });
});

describe("partyHistory and partiesWithNews", () => {
  it("collects the beats that showed or touched a party", () => {
    expect(partyHistory(script, "maya", 6000).map((beat) => beat.id)).toEqual(["ask", "book"]);
    expect(partyHistory(script, "owner", 6000).map((beat) => beat.id)).toEqual(["ask"]);
  });

  it("marks a touched party until it is on screen", () => {
    expect(partiesWithNews(script, 6000)).toEqual(new Set(["owner"]));
    expect(partiesWithNews(script, 10_000)).toEqual(new Set());
  });
});

describe("clockForBeats", () => {
  const clock = clockForBeats(
    [
      { at: 0, time: "2026-03-03T21:47:00" },
      { at: 5000, time: "2026-03-03T21:49:00" },
      { at: 10_000, time: "2026-03-04T08:00:00" },
    ],
    { durationMs: 20_000, endTime: "2026-03-04T08:01:00", raceMs: 1000 },
  );

  it("holds each beat's time, then races to the next in the last second", () => {
    expect(storyTimeAt({ clock }, 3999)).toBe(parseStoryTime("2026-03-03T21:47:00"));
    expect(storyTimeAt({ clock }, 5000)).toBe(parseStoryTime("2026-03-03T21:49:00"));
    expect(storyTimeAt({ clock }, 8999)).toBe(parseStoryTime("2026-03-03T21:49:00"));
    expect(storyTimeAt({ clock }, 10_000)).toBe(parseStoryTime("2026-03-04T08:00:00"));
  });

  it("eases a race of more than an hour and ends on the end time", () => {
    expect(clock.at(-2)).toMatchObject({ at: 10_000, curve: "ease" });
    expect(clock.at(-1)).toMatchObject({ at: 20_000, time: "2026-03-04T08:01:00" });
  });
});
