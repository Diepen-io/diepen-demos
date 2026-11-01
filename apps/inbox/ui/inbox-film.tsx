"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { KeynoteStage } from "@diepen/ui/film/keynote-stage";
import { useMemo } from "react";
import { buildInboxKeynote } from "@/film/inbox-keynote";

/** The film in its own company's brand (decision F1), one element per beat (decision F2). */
export function InboxFilm() {
  const { profile, hrefWithBrand } = useBrand();
  const film = useMemo(() => buildInboxKeynote(profile), [profile]);
  return (
    <KeynoteStage
      film={film}
      liveHref={hrefWithBrand("/live")}
      // On a phone the shell header sits above the stage; on desktop the shell gives the stage the rest of the screen.
      className="max-md:h-[calc(100dvh-7.25rem)] md:h-auto! md:min-h-0 md:flex-1"
    />
  );
}
