"use client";

import { useBrand } from "../brand/brand-provider";
import type { KeynoteFilm } from "./keynote-script";
import { KeynoteStage } from "./keynote-stage";

/**
 * A film page's stage under the demo shell. The page builds the film from its own fictional
 * company (decision F1); "Try it yourself" carries the visitor's profile into live mode.
 */
export function KeynoteFilmView({ film }: { film: KeynoteFilm }) {
  const { hrefWithBrand } = useBrand();
  return (
    <KeynoteStage
      film={film}
      liveHref={hrefWithBrand("/live")}
      // On a phone the shell header sits above the stage; on desktop the shell gives the stage the rest of the screen.
      className="max-md:h-[calc(100dvh-7.25rem)] md:h-auto! md:min-h-0 md:flex-1"
    />
  );
}
