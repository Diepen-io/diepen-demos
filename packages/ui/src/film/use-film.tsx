"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { beatStart, initialPlayback, playbackReducer, startFromSearch, type PlaybackState } from "./film-playback";

export type UseFilmOptions = {
  /** Starts playing on mount, unless the URL has `?t=`. */
  autoplay?: boolean;
  /** Space, R and the arrow keys control the film wherever focus is, except in a text field or a dialog. */
  keyboard?: boolean;
  /** The length of one beat in film ms. The arrow keys go to the start of the previous or next beat. */
  beatMs?: number;
};

export type FilmController = {
  t: number;
  playing: boolean;
  ended: boolean;
  durationMs: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  seek: (t: number) => void;
};

/** Longest frame step. A tab that stalls for a second resumes where it was instead of jumping. */
const MAX_FRAME_MS = 100;

export function useFilm(
  { durationMs }: { durationMs: number },
  { autoplay = true, keyboard = true, beatMs = 5000 }: UseFilmOptions = {},
): FilmController {
  const [state, dispatch] = useReducer(playbackReducer, durationMs, initialPlayback);
  const latest = useRef<PlaybackState>(state);
  useEffect(() => {
    latest.current = state;
  });

  const play = useCallback(() => dispatch({ type: "play" }), []);
  const pause = useCallback(() => dispatch({ type: "pause" }), []);
  const toggle = useCallback(() => dispatch({ type: "toggle" }), []);
  const restart = useCallback(() => dispatch({ type: "restart" }), []);
  const seek = useCallback((t: number) => dispatch({ type: "seek", t }), []);

  // A script built from a new company profile can change length while the film runs.
  useEffect(() => {
    dispatch({ type: "duration", durationMs });
  }, [durationMs]);

  // Once per mount: `?t=` holds a frame for screenshots and recordings; otherwise autoplay decides.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = startFromSearch(window.location.search, latest.current.durationMs);
    if (start !== null) dispatch({ type: "seek", t: start });
    else if (autoplay) dispatch({ type: "play" });
  }, [autoplay]);

  useEffect(() => {
    if (!state.playing) return;
    let last: number | null = null;
    let frame = requestAnimationFrame(function step(now) {
      if (last !== null) dispatch({ type: "tick", elapsedMs: Math.min(now - last, MAX_FRAME_MS) });
      last = now;
      frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [state.playing]);

  useEffect(() => {
    let resumeOnShow = false;
    const onVisibility = () => {
      if (document.hidden) {
        resumeOnShow = latest.current.playing;
        dispatch({ type: "pause" });
      } else if (resumeOnShow) {
        resumeOnShow = false;
        dispatch({ type: "play" });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!keyboard) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      if (keepsOwnKeys(event.target)) return;
      const action = keyAction(event, latest.current, beatMs);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboard, beatMs]);

  return useMemo(
    () => ({
      ...state,
      ended: state.t >= state.durationMs,
      play,
      pause,
      toggle,
      restart,
      seek,
    }),
    [state, play, pause, toggle, restart, seek],
  );
}

function keyAction(event: KeyboardEvent, { t, durationMs }: PlaybackState, beatMs: number) {
  const target = event.target instanceof HTMLElement ? event.target : null;
  // Space toggles the film even on a focused film button: after a click on a progress dot, Space
  // must pause, not press the dot again. Arrows stay with controls that use them, such as tabs.
  const ownsArrows = Boolean(target?.closest("input, [role=slider], [role=radiogroup], [role=tablist]"));
  switch (event.key) {
    case " ":
      return { type: "toggle" } as const;
    case "r":
    case "R":
      return { type: "restart" } as const;
    case "ArrowLeft":
      return ownsArrows ? null : ({ type: "seek", t: beatStart(t, beatMs, durationMs, -1) } as const);
    case "ArrowRight":
      return ownsArrows ? null : ({ type: "seek", t: beatStart(t, beatMs, durationMs, 1) } as const);
    default:
      return null;
  }
}

/** Text fields keep their keys, and so does a dialog such as "Make it yours", whose buttons Space presses. */
function keepsOwnKeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("[role=dialog]")) return true;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  return target instanceof HTMLInputElement && !["range", "checkbox", "radio", "button", "submit"].includes(target.type);
}
