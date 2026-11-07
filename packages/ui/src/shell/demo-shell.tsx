"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { useState, type ReactNode } from "react";
import { BrandMark } from "../brand/brand-mark";
import { useBrand } from "../brand/brand-provider";
import { FictionalBadge } from "../brand/fictional-badge";
import { MakeItYours } from "../brand/make-it-yours";
import { Button } from "../primitives/button";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { Segmented } from "../primitives/segmented";
import { FallbackNote } from "./fallback-note";
import { PageTitleContext } from "./page-title";
import { useRecordMode } from "./record-mode";
import { setUrlParam, useUrlParam } from "./url-param";

export const repositoryUrl = "https://github.com/Diepen-io/diepen-demos";
const studioUrl = "https://diepen.ai";

export type DemoMode = "film" | "live";

export type DemoShellProps = {
  /** The demo's name, for example "Inbox autopilot". */
  title: string;
  mode: DemoMode;
  /** From 768 px up, holds the page to the viewport: main gets the height between header and footer. For a film, which must never scroll. */
  fit?: boolean;
  /** The example companies "Make it yours" offers. Defaults to all presets (decision F3). */
  presets?: readonly CompanyProfile[];
  children: ReactNode;
};

/**
 * The frame every demo page sits in. Needs a BrandProvider above it. `?record=1` hides the top
 * bar and footer for a clean recording; `?fallback=limit` shows the cost guard note.
 */
export function DemoShell({ title, mode, fit, presets, children }: DemoShellProps) {
  const { profile, hrefWithBrand } = useBrand();
  const [panelOpen, setPanelOpen] = useState(false);
  const recording = useRecordMode();
  const fallback = useUrlParam("fallback") === "limit";

  if (recording) return <main className="flex h-dvh flex-col overflow-hidden">{children}</main>;

  // One set of gutters in both modes, so the header does not shift on the Watch or Try it switch.
  const frame = "w-full px-4 md:px-8 2xl:px-12";

  return (
    <div className={cx("flex min-h-dvh flex-col", fit && "md:h-dvh md:overflow-hidden")}>
      <header className="border-b border-border bg-surface">
        <div className={cx(frame, "flex flex-wrap items-center gap-x-4 gap-y-3 py-3")}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <BrandMark profile={profile} size={34} />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-[15px] leading-tight font-semibold tracking-[-0.01em] max-sm:line-clamp-2 sm:truncate">{profile.name}</span>
                <FictionalBadge className="shrink-0 max-sm:hidden" />
              </div>
              {/* On a phone the name gets the whole first line, so the fictional mark sits beside the title. */}
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-[13px] text-muted max-sm:whitespace-nowrap sm:truncate">{title}</h1>
                <FictionalBadge short className="shrink-0 sm:hidden" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between max-sm:order-last">
            <Segmented
              label="Demo mode"
              value={mode}
              options={[
                { value: "film", label: "Watch", href: hrefWithBrand("/") },
                { value: "live", label: "Try it", href: hrefWithBrand("/live") },
              ]}
            />
            <a
              href={studioUrl}
              className="inline-flex h-11 items-center px-2 text-[13px] font-medium text-faint transition-colors hover:text-foreground sm:order-last sm:h-auto"
            >
              diepen.ai
            </a>
          </div>
          {/* A quiet tool for sales calls: the mode switch and the live guide carry the visitor. */}
          <Button variant="ghost" size="sm" className="text-muted hover:text-foreground" onClick={() => setPanelOpen(true)}>
            <Icon name="sparkle" size={15} />
            Make it yours
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        {fallback && (
          <div className={cx(frame, "pt-4")}>
            <FallbackNote
              filmHref={mode === "live" ? hrefWithBrand("/") : undefined}
              onDismiss={() => setUrlParam("fallback", null)}
            />
          </div>
        )}
        <PageTitleContext value={true}>{children}</PageTitleContext>
      </main>

      <footer className={cx(frame, "py-5 text-[13px] text-faint")}>
        {profile.fictional
          ? `A diepen.ai demo with ${profile.name}, a fictional company.`
          : `A diepen.ai demo in ${profile.name}'s brand.`}{" "}
        <a
          href={repositoryUrl}
          className="text-muted underline decoration-1 underline-offset-[3px] hover:text-foreground"
        >
          Source code on GitHub
        </a>
      </footer>

      <MakeItYours open={panelOpen} onClose={() => setPanelOpen(false)} presets={presets} />
    </div>
  );
}
