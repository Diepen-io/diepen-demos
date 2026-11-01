"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { FilmStage } from "@diepen/ui/film/film-stage";
import { useMemo } from "react";
import { documentsLayout } from "@/ui/documents-lanes";
import { documentsFilm } from "./documents-film";
import { filmLaneRenderer } from "./render-film-lane";

/**
 * The film inside the demo shell. The stage gives up its own full height and takes what the shell
 * leaves, so header, lanes, caption and controls fit one screen without a page scroll.
 */
export function DocumentsFilmStage() {
  const { profile, hrefWithBrand } = useBrand();
  const script = useMemo(() => documentsFilm(profile), [profile]);
  const renderLane = useMemo(() => filmLaneRenderer(script, profile), [script, profile]);
  return (
    <FilmStage
      script={script}
      renderLane={renderLane}
      layout={documentsLayout}
      liveHref={hrefWithBrand("/live")}
      className="h-auto! min-h-[760px] flex-1 md:min-h-0 md:basis-0"
    />
  );
}
