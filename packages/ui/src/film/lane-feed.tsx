"use client";

import { useState, type ReactNode } from "react";
import { beatArrival, type FilmBeat } from "./film-script";
import type { LaneContext } from "./film-stage";

export type LaneFeedProps<TData> = {
  ctx: LaneContext<TData>;
  /** Renders one beat, for example a chat bubble or an email row. */
  render: (beat: FilmBeat<TData>) => ReactNode;
  /** Older beats beyond this count leave the DOM; they are clipped from view long before. */
  limit?: number;
};

/** An item that landed this recently enters with motion. Older ones, reached by a seek, just appear. */
const FRESH_MS = 700;

/** The usual lane body: every beat of the lane as one item, newest at the bottom. */
export function LaneFeed<TData>({ ctx, render, limit = 12 }: LaneFeedProps<TData>) {
  return (
    <>
      {ctx.beats.slice(-limit).map((beat) => (
        <FeedItem key={beat.id} fresh={ctx.t - beatArrival(beat) < FRESH_MS}>
          {render(beat)}
        </FeedItem>
      ))}
    </>
  );
}

function FeedItem({ fresh, children }: { fresh: boolean; children: ReactNode }) {
  // Decided once at mount: a later re-render must not replay the entrance.
  const [enters] = useState(fresh);
  return <div className={enters ? "enter origin-bottom" : undefined}>{children}</div>;
}
