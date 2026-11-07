/** The playback state machine behind `useFilm`, kept pure so it is tested without a browser. */

export type PlaybackState = {
  t: number;
  playing: boolean;
  durationMs: number;
};

export type PlaybackAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "toggle" }
  | { type: "restart" }
  | { type: "seek"; t: number }
  | { type: "duration"; durationMs: number }
  | { type: "tick"; elapsedMs: number };

export function initialPlayback(durationMs: number): PlaybackState {
  return { t: 0, playing: false, durationMs };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "play":
      // Play at the end starts over, the way a video player does.
      return state.t >= state.durationMs ? { ...state, t: 0, playing: true } : { ...state, playing: true };
    case "pause":
      return state.playing ? { ...state, playing: false } : state;
    case "toggle":
      return playbackReducer(state, { type: state.playing ? "pause" : "play" });
    case "restart":
      return { ...state, t: 0, playing: true };
    case "seek": {
      const t = clamp(action.t, 0, state.durationMs);
      return { ...state, t, playing: state.playing && t < state.durationMs };
    }
    case "duration": {
      // A new script, for example after a brand change. Keep the place when it still exists.
      if (action.durationMs === state.durationMs) return state;
      const t = Math.min(state.t, action.durationMs);
      return { ...state, durationMs: action.durationMs, t, playing: state.playing && t < action.durationMs };
    }
    case "tick": {
      if (!state.playing) return state;
      const t = Math.min(state.t + action.elapsedMs, state.durationMs);
      return { ...state, t, playing: t < state.durationMs };
    }
  }
}

/**
 * The start of the beat `delta` beats away from the one at `t`, for films cut into beats of
 * `beatMs`. Clamped to the first and the last beat, so Next on the last beat stays on it.
 */
export function beatStart(t: number, beatMs: number, durationMs: number, delta: -1 | 1): number {
  const last = Math.max(0, Math.ceil(durationMs / beatMs) - 1);
  const current = Math.min(Math.floor(t / beatMs), last);
  return clamp(current + delta, 0, last) * beatMs;
}

/** Reads `?t=<ms>` from a query string. Returns null when it is missing or not a number. */
export function startFromSearch(search: string, durationMs: number): number | null {
  const raw = new URLSearchParams(search).get("t");
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? clamp(value, 0, durationMs) : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
