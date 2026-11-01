/** The playback state machine behind `useFilm`, kept pure so it is tested without a browser. */

export const FILM_SPEEDS = [0.5, 1, 1.5, 2] as const;

export type FilmSpeed = (typeof FILM_SPEEDS)[number];

export type PlaybackState = {
  t: number;
  playing: boolean;
  speed: FilmSpeed;
  durationMs: number;
};

export type PlaybackAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "toggle" }
  | { type: "restart" }
  | { type: "seek"; t: number }
  | { type: "speed"; speed: FilmSpeed }
  | { type: "duration"; durationMs: number }
  | { type: "tick"; elapsedMs: number };

export function initialPlayback(durationMs: number): PlaybackState {
  return { t: 0, playing: false, speed: 1, durationMs };
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
    case "speed":
      return { ...state, speed: action.speed };
    case "duration": {
      // A new script, for example after a brand change. Keep the place when it still exists.
      if (action.durationMs === state.durationMs) return state;
      const t = Math.min(state.t, action.durationMs);
      return { ...state, durationMs: action.durationMs, t, playing: state.playing && t < action.durationMs };
    }
    case "tick": {
      if (!state.playing) return state;
      const t = Math.min(state.t + action.elapsedMs * state.speed, state.durationMs);
      return { ...state, t, playing: t < state.durationMs };
    }
  }
}

/** The next speed in the cycle 0.5, 1, 1.5, 2, then back to 0.5. */
export function nextSpeed(speed: FilmSpeed): FilmSpeed {
  const index = FILM_SPEEDS.indexOf(speed);
  return FILM_SPEEDS[(index + 1) % FILM_SPEEDS.length] ?? 1;
}

/** Reads `?t=<ms>` from a query string. Returns null when it is missing or not a number. */
export function startFromSearch(search: string, durationMs: number): number | null {
  const raw = new URLSearchParams(search).get("t");
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? clamp(value, 0, durationMs) : null;
}

/** Film time as "1:05". */
export function formatFilmTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
