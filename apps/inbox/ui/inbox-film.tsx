"use client";

import { BrandMark } from "@diepen/ui/brand/brand-mark";
import { useBrand } from "@diepen/ui/brand/brand-provider";
import { FictionalBadge } from "@diepen/ui/brand/fictional-badge";
import { FocusStage } from "@diepen/ui/film/focus-stage";
import { useRecordMode } from "@diepen/ui/shell/record-mode";
import { inboxFilmFor } from "@/film/film-state";
import { InboxFilmPanel } from "./film-panels";

/** The film in its own company's brand (decision F1). */
export function InboxFilm() {
  const { profile, hrefWithBrand } = useBrand();
  // A recording has no shell header, so the stage names the company and marks it fictional itself.
  const recording = useRecordMode();

  return (
    <FocusStage
      script={inboxFilmFor(profile)}
      brand={recording ? <BrandMark profile={profile} size={42} /> : undefined}
      badge={recording ? <FictionalBadge size="lg" /> : undefined}
      liveHref={hrefWithBrand("/live")}
      // On a phone the shell header sits above the stage, so the stage leaves its height free for the caption and controls.
      className="max-md:h-[calc(100dvh-7.25rem)] md:h-auto! md:min-h-0 md:flex-1"
      renderPanel={(ctx) => <InboxFilmPanel ctx={ctx} profile={profile} />}
    />
  );
}
