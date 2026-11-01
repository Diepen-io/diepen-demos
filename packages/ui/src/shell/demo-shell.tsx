"use client";

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
  children: ReactNode;
};

/**
 * The frame every demo page sits in. Needs a BrandProvider above it. `?record=1` hides the top
 * bar and footer for a clean recording; `?fallback=limit` shows the cost guard note.
 */
export function DemoShell({ title, mode, fit, children }: DemoShellProps) {
  const { profile, hrefWithBrand } = useBrand();
  const [panelOpen, setPanelOpen] = useState(false);
  const recording = useRecordMode();
  const fallback = useUrlParam("fallback") === "limit";

  if (recording) return <main className="flex h-dvh flex-col overflow-hidden">{children}</main>;

  return (
    <div className={cx("flex min-h-dvh flex-col", fit && "md:h-dvh md:overflow-hidden")}>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <BrandMark profile={profile} size={34} />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">{profile.name}</span>
                <FictionalBadge className="max-sm:hidden" />
              </div>
              <h1 className="truncate text-[13px] text-muted">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between max-sm:order-last">
            <Segmented
              label="Demo mode"
              value={mode}
              options={[
                { value: "film", label: "Film", href: hrefWithBrand("/") },
                { value: "live", label: "Live", href: hrefWithBrand("/live") },
              ]}
            />
            <a
              href={studioUrl}
              className="px-2 text-[13px] font-medium text-faint transition-colors hover:text-foreground sm:order-last"
            >
              diepen.ai
            </a>
          </div>
          <Button variant="secondary" onClick={() => setPanelOpen(true)}>
            <Icon name="sparkle" size={16} />
            Make it yours
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        {fallback && (
          <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6">
            <FallbackNote
              filmHref={mode === "live" ? hrefWithBrand("/") : undefined}
              onDismiss={() => setUrlParam("fallback", null)}
            />
          </div>
        )}
        {children}
      </main>

      <footer className="mx-auto w-full max-w-[1440px] px-4 py-5 text-[13px] text-faint sm:px-6">
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

      <MakeItYours open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
