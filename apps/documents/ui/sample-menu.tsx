"use client";

import { sampleDocuments, type SampleDocument } from "@/domain/sample-documents";
import type { UploadItemId } from "@/domain/document-request";
import { FileIcon, fileKindOf } from "@diepen/ui/mockups/file-icon";
import { useEffect, useRef } from "react";

export type SampleMenuProps = {
  itemId: UploadItemId;
  onPick: (sample: SampleDocument) => void;
  onClose: () => void;
};

/** The samples for one item, by what is in them, for example "2024 statement". */
export function SampleMenu({ itemId, onPick, onClose }: SampleMenuProps) {
  const menu = useRef<HTMLDivElement>(null);
  const samples = sampleDocuments.filter((sample) => sample.itemId === itemId);

  useEffect(() => {
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointer = (event: PointerEvent) => {
      if (!menu.current?.parentElement?.contains(event.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [onClose]);

  return (
    <div ref={menu} role="menu" aria-label="Sample files" className="enter flex flex-col gap-0.5 rounded-xl bg-surface p-1 shadow-[0_0_0_1px_var(--border),0_8px_24px_-8px_rgb(0_0_0/0.18)]">
      {samples.map((sample) => (
        <button
          key={sample.fileName}
          type="button"
          role="menuitem"
          aria-label={sample.menuLabel}
          onClick={() => onPick(sample)}
          className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left outline-offset-0 hover:bg-subtle focus-visible:bg-subtle"
        >
          <FileIcon kind={fileKindOf(sample.fileName)} size={20} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-medium">{sample.menuLabel}</span>
            <span className="block truncate text-[12px] text-faint">{sample.fileName}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
