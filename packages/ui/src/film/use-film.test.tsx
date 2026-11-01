import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatFilmTime, initialPlayback, nextSpeed, playbackReducer, startFromSearch } from "./film-playback";
import { useFilm } from "./use-film";

describe("playbackReducer", () => {
  const start = initialPlayback(10_000);

  it("advances by elapsed time times speed and stops at the end", () => {
    let state = playbackReducer(start, { type: "play" });
    state = playbackReducer(playbackReducer(state, { type: "speed", speed: 2 }), { type: "tick", elapsedMs: 1000 });
    expect(state.t).toBe(2000);
    state = playbackReducer(state, { type: "tick", elapsedMs: 9000 });
    expect(state).toMatchObject({ t: 10_000, playing: false });
  });

  it("ignores ticks while paused", () => {
    expect(playbackReducer(start, { type: "tick", elapsedMs: 500 }).t).toBe(0);
  });

  it("plays from the start when play is pressed at the end", () => {
    const ended = { ...start, t: 10_000 };
    expect(playbackReducer(ended, { type: "play" })).toMatchObject({ t: 0, playing: true });
  });

  it("clamps a seek to the film", () => {
    expect(playbackReducer(start, { type: "seek", t: -50 }).t).toBe(0);
    expect(playbackReducer(start, { type: "seek", t: 99_000 }).t).toBe(10_000);
  });

  it("cycles speeds", () => {
    expect([nextSpeed(0.5), nextSpeed(1), nextSpeed(1.5), nextSpeed(2)]).toEqual([1, 1.5, 2, 0.5]);
  });

  it("reads ?t= from the query string", () => {
    expect(startFromSearch("?t=4200", 10_000)).toBe(4200);
    expect(startFromSearch("?t=abc", 10_000)).toBeNull();
    expect(startFromSearch("", 10_000)).toBeNull();
    expect(startFromSearch("?t=50000", 10_000)).toBe(10_000);
  });

  it("keeps its place when a new script changes the length", () => {
    const playing = { ...start, t: 6000, playing: true };
    expect(playbackReducer(playing, { type: "duration", durationMs: 12_000 })).toMatchObject({ t: 6000, playing: true, durationMs: 12_000 });
    expect(playbackReducer(playing, { type: "duration", durationMs: 4000 })).toMatchObject({ t: 4000, playing: false });
  });

  it("formats film time as minutes and seconds", () => {
    expect(formatFilmTime(65_400)).toBe("1:05");
  });
});

describe("useFilm", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "Date"] });
    window.history.replaceState(null, "", "/");
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  const press = (key: string, target: EventTarget = document.body) =>
    act(() => {
      target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    });

  it("autoplays and moves film time with animation frames", () => {
    const { result } = renderHook(() => useFilm({ durationMs: 10_000 }));
    expect(result.current.playing).toBe(true);
    advance(1000);
    expect(result.current.t).toBeGreaterThan(900);
    expect(result.current.t).toBeLessThanOrEqual(1000);
  });

  it("runs faster at a higher speed and ends at the duration", () => {
    const { result } = renderHook(() => useFilm({ durationMs: 3000 }));
    act(() => result.current.setSpeed(2));
    advance(1000);
    expect(result.current.t).toBeGreaterThan(1800);
    advance(2000);
    expect(result.current).toMatchObject({ t: 3000, playing: false, ended: true });
  });

  it("starts paused at ?t=", () => {
    window.history.replaceState(null, "", "/?t=4000");
    const { result } = renderHook(() => useFilm({ durationMs: 10_000 }));
    expect(result.current).toMatchObject({ t: 4000, playing: false });
  });

  it("answers Space, R and the arrow keys, but not inside a text field", () => {
    const { result } = renderHook(() => useFilm({ durationMs: 20_000 }, { autoplay: false }));
    press(" ");
    expect(result.current.playing).toBe(true);
    press(" ");
    expect(result.current.playing).toBe(false);
    press("ArrowRight");
    expect(result.current.t).toBe(5000);
    press("ArrowLeft");
    expect(result.current.t).toBe(0);

    const field = document.body.appendChild(document.createElement("input"));
    press(" ", field);
    expect(result.current.playing).toBe(false);
    field.remove();

    act(() => result.current.seek(8000));
    press("r");
    expect(result.current).toMatchObject({ t: 0, playing: true });
  });

  it("follows a new script length without restarting", () => {
    const { result, rerender } = renderHook(({ durationMs }) => useFilm({ durationMs }), { initialProps: { durationMs: 10_000 } });
    advance(2000);
    rerender({ durationMs: 20_000 });
    expect(result.current).toMatchObject({ durationMs: 20_000, playing: true });
    expect(result.current.t).toBeGreaterThan(1800);
  });

  it("pauses while the tab is hidden and resumes when it shows again", () => {
    const { result } = renderHook(() => useFilm({ durationMs: 10_000 }));
    const setHidden = (hidden: boolean) =>
      act(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
        document.dispatchEvent(new Event("visibilitychange"));
      });
    setHidden(true);
    expect(result.current.playing).toBe(false);
    setHidden(false);
    expect(result.current.playing).toBe(true);
  });
});
