"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { FilmStage } from "@diepen/ui/film/film-stage";
import type { FilmLayout } from "@diepen/ui/film/film-layout";
import { useRecordMode } from "@diepen/ui/shell/record-mode";
import { useMemo } from "react";
import { buildMeetingsFilm } from "@/film/meetings-film";
import { renderFilmLane } from "@/ui/lanes/render-lane";
import { FallbackToast } from "./fallback-toast";
import { FilmActions, FilmBrand } from "./film-header";

/** Call 26%, AI 22%, CRM over Calendar 22%, Proposal and email 30%. */
const layout: FilmLayout = {
  columns: [
    { lanes: ["call"], width: "26fr" },
    { lanes: ["ai"], width: "22fr" },
    { lanes: ["crm", "calendar"], width: "22fr" },
    { lanes: ["proposal"], width: "30fr" },
  ],
};

/** The film in the active company's brand. Built from recorded fixtures: no key, no network. */
export function MeetingsFilmStage() {
  const { profile, hrefWithBrand } = useBrand();
  const recording = useRecordMode();
  const script = useMemo(() => buildMeetingsFilm(profile), [profile]);
  return (
    <main className="relative">
      <FilmStage
        script={script}
        layout={layout}
        brand={<FilmBrand />}
        actions={recording ? null : <FilmActions />}
        liveHref={hrefWithBrand("/live")}
        renderLane={(lane, ctx) => renderFilmLane(lane, ctx, profile)}
      />
      <FallbackToast />
    </main>
  );
}
