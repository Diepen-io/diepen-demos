import { describe, expect, it } from "vitest";
import {
  activeCaption,
  activeTravels,
  beatsUntil,
  defineFilmScript,
  focusLane,
  parseStoryTime,
  receivingLanes,
  storyRateAt,
  storyTimeAt,
  type FilmScript,
} from "./film-script";

const script = defineFilmScript<{ text: string }>({
  id: "test",
  title: "Test film",
  durationMs: 20_000,
  lanes: [
    { id: "customer", label: "Maya", role: "Customer" },
    { id: "ai", label: "Assistant", role: "AI", brand: true },
  ],
  clock: [
    { at: 0, time: "2026-03-03T21:47" },
    { at: 4000, time: "2026-03-03T21:48" },
    { at: 8000, time: "2026-03-04T09:00", curve: "ease" },
  ],
  beats: [
    { id: "reply", at: 5000, lane: "customer", caption: "The AI answers", travel: { from: "ai", label: "Reply", kind: "message" }, data: { text: "Hi" } },
    { id: "ask", at: 1000, lane: "customer", caption: "Maya writes at night", data: { text: "Open?" } },
    { id: "note", at: 2000, lane: "ai", data: { text: "Reading" } },
  ],
  end: { at: 15_000, metric: "Reply time", before: "9 hours", after: "40 seconds" },
});

describe("defineFilmScript", () => {
  it("sorts beats by start time", () => {
    expect(script.beats.map((beat) => beat.id)).toEqual(["ask", "note", "reply"]);
  });

  it("rejects a beat in a lane that does not exist", () => {
    const broken: FilmScript<null> = { ...script, beats: [{ id: "x", at: 0, lane: "owner", data: null }] };
    expect(() => defineFilmScript(broken)).toThrow(/unknown lane "owner"/);
  });

  it("rejects a travel from a lane that does not exist", () => {
    const broken: FilmScript<null> = {
      ...script,
      beats: [{ id: "x", at: 0, lane: "ai", travel: { from: "crm", label: "Row", kind: "event" }, data: null }],
    };
    expect(() => defineFilmScript(broken)).toThrow(/unknown lane "crm"/);
  });

  it("rejects a beat that lands after the film ends", () => {
    const broken: FilmScript<null> = { ...script, beats: [{ id: "x", at: 19_900, lane: "ai", travel: { from: "customer", label: "Late", kind: "message" }, data: null }] };
    expect(() => defineFilmScript(broken)).toThrow(/lands after the film ends/);
  });
});

describe("beatsUntil", () => {
  it("shows a beat from its start time", () => {
    expect(beatsUntil(script, 999).map((beat) => beat.id)).toEqual([]);
    expect(beatsUntil(script, 1000).map((beat) => beat.id)).toEqual(["ask"]);
  });

  it("shows a travelling beat only once it lands", () => {
    expect(beatsUntil(script, 5799).map((beat) => beat.id)).toEqual(["ask", "note"]);
    expect(beatsUntil(script, 5800).map((beat) => beat.id)).toEqual(["ask", "note", "reply"]);
  });
});

describe("activeTravels", () => {
  it("reports the flight and its progress between start and landing", () => {
    expect(activeTravels(script, 4999)).toEqual([]);
    const [travel] = activeTravels(script, 5400);
    expect(travel).toMatchObject({ from: "ai", to: "customer", progress: 0.5 });
    expect(activeTravels(script, 5800)).toEqual([]);
  });
});

describe("activeCaption", () => {
  it("keeps the latest caption until the next one and clears it for the end card", () => {
    expect(activeCaption(script, 500)).toBeNull();
    expect(activeCaption(script, 3000)).toEqual({ beatId: "ask", text: "Maya writes at night" });
    expect(activeCaption(script, 5000)).toEqual({ beatId: "reply", text: "The AI answers" });
    expect(activeCaption(script, 15_000)).toBeNull();
  });
});

describe("focusLane and receivingLanes", () => {
  it("follows the flight, then the lane that received the latest item", () => {
    expect(focusLane(script, 0)).toBe("customer");
    expect(focusLane(script, 2500)).toBe("ai");
    expect(focusLane(script, 5400)).toBe("customer");
  });

  it("marks a lane as receiving shortly before and after a landing", () => {
    expect(receivingLanes(script, 5000).has("customer")).toBe(false);
    expect(receivingLanes(script, 5600).has("customer")).toBe(true);
    expect(receivingLanes(script, 6400).has("customer")).toBe(true);
    expect(receivingLanes(script, 6600).has("customer")).toBe(false);
  });
});

describe("storyTimeAt", () => {
  const at = (time: string) => parseStoryTime(time);

  it("holds the first time before the first keyframe and the last after the last", () => {
    expect(storyTimeAt(script, 0)).toBe(at("2026-03-03T21:47"));
    expect(storyTimeAt(script, 19_000)).toBe(at("2026-03-04T09:00"));
  });

  it("interpolates linearly by default", () => {
    expect(storyTimeAt(script, 2000)).toBe(at("2026-03-03T21:47:30"));
  });

  it("eases a racing segment so it starts and ends slowly", () => {
    const start = at("2026-03-03T21:48");
    const span = at("2026-03-04T09:00") - start;
    expect(storyTimeAt(script, 6000)).toBe(start + span / 2);
    expect(storyTimeAt(script, 4400) - start).toBeLessThan(span * 0.01);
  });

  it("reads wall-clock times the same in every time zone", () => {
    expect(new Date(at("2026-03-03T21:47")).getUTCHours()).toBe(21);
  });

  it("reports how much faster story time runs than film time", () => {
    expect(storyRateAt(script, 2000)).toBeCloseTo(15, 5);
    expect(storyRateAt(script, 6000)).toBeGreaterThan(10_000);
  });
});
