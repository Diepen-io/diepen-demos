"use client";

import { BrandMark } from "@diepen/ui/brand/brand-mark";
import { useBrand } from "@diepen/ui/brand/brand-provider";
import { FictionalBadge } from "@diepen/ui/brand/fictional-badge";
import { MakeItYours } from "@diepen/ui/brand/make-it-yours";
import { Badge } from "@diepen/ui/primitives/badge";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { Segmented } from "@diepen/ui/primitives/segmented";
import { useState } from "react";

/**
 * The film page uses the film stage's own header instead of the demo shell, so the whole film
 * fits one screen. These are the shell's pieces it needs: the company, the mode switch and
 * "Make it yours".
 */
export function FilmBrand() {
  const { profile } = useBrand();
  return (
    <>
      <BrandMark profile={profile} size={36} />
      <span className="hidden min-w-0 truncate text-[14px] font-medium text-muted 2xl:block">{profile.name}</span>
      <span className="hidden lg:contents">
        <FictionalBadge />
      </span>
      {profile.fictional && (
        <span className="contents lg:hidden">
          <Badge tone="neutral">Fictional</Badge>
        </span>
      )}
      <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border max-md:hidden" />
    </>
  );
}

export function FilmActions() {
  const { hrefWithBrand } = useBrand();
  const [panelOpen, setPanelOpen] = useState(false);
  return (
    <>
      <a
        href={hrefWithBrand("/live")}
        className="press inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-surface px-3 text-sm font-medium shadow-[0_0_0_1px_var(--border)] md:hidden"
      >
        Live
        <Icon name="arrowRight" size={15} />
      </a>
      <Segmented
        className="max-md:hidden"
        label="Demo mode"
        value="film"
        options={[
          { value: "film", label: "Film", href: hrefWithBrand("/") },
          { value: "live", label: "Live", href: hrefWithBrand("/live") },
        ]}
      />
      <Button variant="secondary" onClick={() => setPanelOpen(true)}>
        <Icon name="sparkle" size={16} />
        <span className="max-sm:sr-only">Make it yours</span>
      </Button>
      <MakeItYours open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
