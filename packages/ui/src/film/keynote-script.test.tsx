import { describe, expect, it } from "vitest";
import { defineKeynoteFilm, keynoteDurationMs, keynoteStepAt, type KeynoteFilm } from "./keynote-script";

const film: KeynoteFilm = {
  id: "test",
  title: "Test",
  beatMs: 3000,
  beats: ["one", "two", "three", "four"].map((id) => ({ id, caption: "A short caption.", element: null })),
  finale: { label: "Reply time", before: "9 h", after: "38 s", note: "A simulation." },
};

describe("keynote films", () => {
  it("runs each beat and the finale for one beat length", () => {
    expect(keynoteDurationMs(film)).toBe(15_000);
    expect(keynoteStepAt(film, 0)).toBe(0);
    expect(keynoteStepAt(film, 2999)).toBe(0);
    expect(keynoteStepAt(film, 3000)).toBe(1);
    expect(keynoteStepAt(film, 12_000)).toBe(4);
    expect(keynoteStepAt(film, 99_000)).toBe(4);
  });

  it("rejects captions over six words and dashes", () => {
    const [first, ...rest] = film.beats;
    const withCaption = (caption: string) => ({ ...film, beats: [{ id: first?.id ?? "one", caption, element: null }, ...rest] });
    expect(() => defineKeynoteFilm(withCaption("one two three four five six seven"))).toThrow(/6/);
    expect(() => defineKeynoteFilm(withCaption("Sent — now"))).toThrow(/dash/);
    expect(defineKeynoteFilm(film)).toBe(film);
  });

  it("requires exactly four beats before the finale", () => {
    expect(() => defineKeynoteFilm({ ...film, beats: film.beats.slice(0, 3) })).toThrow(/4 beats/);
    expect(() => defineKeynoteFilm({ ...film, beats: [...film.beats, { id: "five", caption: "Five.", element: null }] })).toThrow(/4 beats/);
  });
});
