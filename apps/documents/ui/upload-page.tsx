"use client";

import { BrandMark } from "@diepen/ui/brand/brand-mark";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import type { CompanyProfile } from "@diepen/voice/profile";
import { UploadItem, type UploadRow, type UploadRowActions } from "./upload-item";

export type UploadPageProps = {
  profile: CompanyProfile;
  rows: UploadRow[];
  /** Live mode only. The film shows the same page without handlers. */
  actionsFor?: (row: UploadRow) => UploadRowActions;
  onDone?: () => void;
  doneDisabled?: boolean;
  /** Back to the inbox, in live mode. */
  onBack?: () => void;
};

/** The host the client sees in the address bar: the firm's own site, or a neutral one. */
export function uploadHost(profile: CompanyProfile): string {
  if (!profile.website) return "upload.example";
  try {
    return new URL(profile.website).host.replace(/^www\./, "");
  } catch {
    return "upload.example";
  }
}

/** The page behind "Upload and sign": the firm's brand, the six items, one button to finish. */
export function UploadPage({ profile, rows, actionsFor, onDone, doneDisabled, onBack }: UploadPageProps) {
  const done = rows.filter((row) => row.state === "checked").length;
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-subtle px-3 py-2">
        {onBack && (
          <button
            type="button"
            aria-label="Back to the inbox"
            onClick={onBack}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface"
          >
            <Icon name="chevronLeft" size={17} />
          </button>
        )}
        <span className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-[12px] text-muted shadow-[inset_0_0_0_1px_var(--border)]">
          <Icon name="globe" size={13} className="shrink-0 text-faint" />
          <span className="truncate">
            <span className="text-foreground">{uploadHost(profile)}</span>/upload/okafor-2025
          </span>
        </span>
      </div>
      <header className="flex flex-col gap-3 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <BrandMark profile={profile} size={30} />
          <span className="min-w-0 truncate text-[14px] font-semibold">{profile.name}</span>
        </div>
        <div>
          <h2 className="text-[19px] leading-tight font-semibold tracking-[-0.015em]">Your 2025 tax return</h2>
          <p className="tabular text-meta text-muted">
            {done} of {rows.length} done. Due 31 Mar 2026.
          </p>
        </div>
      </header>
      <ul aria-label="Requested documents" className="border-t border-border">
        {rows.map((row) => (
          <UploadItem key={row.item.id} row={row} actions={actionsFor?.(row)} />
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-3 px-4 pt-4 pb-5">
        <p className="text-[12px] leading-snug text-faint">
          PDF, PNG or JPEG, up to 4 MB. Your file goes to Claude for this one check. This demo keeps no copy.
        </p>
        <Button variant="brand" className="w-full" onClick={onDone} disabled={doneDisabled}>
          Done for now
        </Button>
      </div>
    </div>
  );
}
