import { describe, expect, it } from "vitest";
import { beatStart } from "./film-playback";

describe("beatStart", () => {
  const beatMs = 3200;
  const durationMs = 16_000;

  it("goes to the start of the next or the previous beat from anywhere inside a beat", () => {
    expect(beatStart(4000, beatMs, durationMs, 1)).toBe(6400);
    expect(beatStart(4000, beatMs, durationMs, -1)).toBe(0);
  });

  it("stays on the first and the last beat, also at the very end", () => {
    expect(beatStart(0, beatMs, durationMs, -1)).toBe(0);
    expect(beatStart(13_000, beatMs, durationMs, 1)).toBe(12_800);
    expect(beatStart(durationMs, beatMs, durationMs, -1)).toBe(9600);
  });
});
