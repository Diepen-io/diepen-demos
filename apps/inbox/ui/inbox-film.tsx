"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { FilmStage } from "@diepen/ui/film/film-stage";
import type { FilmLayout } from "@diepen/ui/film/film-layout";
import { inboxFilmFor, snapshotAt } from "@/film/film-state";
import { FilmLane } from "./film-lanes";

const layout: FilmLayout = {
  columns: [
    { lanes: ["customers"], width: "35fr" },
    { lanes: ["ai"], width: "18fr" },
    { lanes: ["calendar"], width: "26fr" },
    { lanes: ["owner"], width: "21fr" },
  ],
};

/** The film in the active company's brand. A new profile keeps the film time and redraws every lane. */
export function InboxFilm() {
  const { profile, hrefWithBrand } = useBrand();
  const script = inboxFilmFor(profile);

  return (
    <FilmStage
      script={script}
      layout={layout}
      liveHref={hrefWithBrand("/live")}
      // On a phone the shell header sits above the stage, so the stage leaves its height free for the caption and controls.
      className="max-md:h-[calc(100dvh-7.25rem)] md:h-auto! md:min-h-0 md:flex-1"
      renderLane={(lane, ctx) => <FilmLane laneId={lane.id} snapshot={snapshotAt(ctx.t, profile)} t={ctx.t} profile={profile} />}
    />
  );
}
