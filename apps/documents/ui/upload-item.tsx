"use client";

import { isUploadItemId, type ItemState, type RequestItem } from "@/domain/document-request";
import type { SampleDocument } from "@/domain/sample-documents";
import { StatusBadge } from "@diepen/ui/primitives/badge";
import { Button } from "@diepen/ui/primitives/button";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { FileIcon, fileKindOf } from "@diepen/ui/mockups/file-icon";
import { useCallback, useRef, useState, type DragEvent } from "react";
import { acceptAttribute } from "./file-guard";
import { MiddleTruncate } from "./middle-truncate";
import { SampleMenu } from "./sample-menu";
import { touchTarget } from "./touch-target";

export type UploadRow = {
  item: Pick<RequestItem, "id" | "label" | "detail" | "kind">;
  state: ItemState;
  /** The file on its way or being checked. `uploading` draws the transfer bar. */
  file?: { name: string; uploading: boolean };
  /** Why the item is back with the client, for a problem. */
  reason?: string;
  /** A file the browser refused, or a check that did not finish. */
  error?: string;
  fresh?: boolean;
};

export type UploadRowActions = {
  onFile: (file: File) => void;
  onSample: (sample: SampleDocument) => void;
  onReviewSign: () => void;
};

/** One requested document on the upload page: what it is, where it stands, and how to send it. */
export function UploadItem({ row, actions }: { row: UploadRow; actions?: UploadRowActions }) {
  const { item, state, file, reason, error } = row;
  const input = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const canUpload = item.kind === "upload" && (state === "missing" || state === "problem");

  function drop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped && canUpload) actions?.onFile(dropped);
  }

  return (
    <li
      onDragOver={(event) => {
        if (!canUpload) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      className={cx(
        "flex flex-col gap-2 border-b border-border px-4 py-3.5 transition-colors duration-200",
        dragging && "bg-brand-soft",
        row.fresh && "enter",
      )}
    >
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
        <div className="min-w-[9rem] flex-1">
          <p className="text-[15px] leading-snug font-medium">{item.label}</p>
          <p className="text-meta text-muted">{item.detail}</p>
        </div>
        <StatusBadge status={state} className="mt-0.5" />
      </div>

      {file && (
        <div className="flex items-center gap-2 rounded-lg bg-subtle px-2.5 py-2">
          <FileIcon kind={fileKindOf(file.name)} size={18} />
          <MiddleTruncate text={file.name} className="flex-1 text-[13px]" />
          {file.uploading && <span className="shrink-0 text-[12px] text-muted">Uploading</span>}
        </div>
      )}
      {file?.uploading && (
        <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-border">
          <div className="upload-bar h-full origin-left rounded-full bg-brand" />
        </div>
      )}
      {state === "problem" && reason && (
        <p className="flex gap-1.5 text-[14px] leading-snug text-fail">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          {reason}
        </p>
      )}
      {error && <p className="text-[14px] leading-snug text-fail">{error}</p>}

      {item.kind === "signature" && state === "missing" && (
        <Button variant="brand" size="sm" className={cx("self-start", touchTarget)} onClick={actions?.onReviewSign}>
          Review and sign
          <Icon name="chevronRight" size={15} />
        </Button>
      )}
      {canUpload && isUploadItemId(item.id) && (
        <div className="flex flex-col gap-2">
          {/* A tight gap and a narrow ghost button keep "Use a sample" beside "Upload again" in a phone-wide lane. */}
          <div className="flex flex-wrap gap-1">
            <Button variant="secondary" size="sm" className={touchTarget} onClick={() => input.current?.click()}>
              <Icon name="paperclip" size={14} />
              {state === "problem" ? "Upload again" : "Upload"}
            </Button>
            <Button variant="ghost" size="sm" className="px-2 max-md:h-11 max-md:text-[14px]" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              Use a sample
              <Icon name="chevronRight" size={14} className={cx("transition-transform duration-200", menuOpen && "rotate-90")} />
            </Button>
          </div>
          {menuOpen && (
            <SampleMenu
              itemId={item.id}
              onClose={closeMenu}
              onPick={(sample) => {
                setMenuOpen(false);
                actions?.onSample(sample);
              }}
            />
          )}
          <input
            ref={input}
            type="file"
            name={`file-${item.id}`}
            accept={acceptAttribute}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              event.target.value = "";
              if (picked) actions?.onFile(picked);
            }}
          />
        </div>
      )}
    </li>
  );
}
