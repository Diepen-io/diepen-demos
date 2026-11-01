"use client";

import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { Badge, StatusBadge, type DocumentStatus } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { FileIcon, fileKindOf, type FileKind } from "./file-icon";

export type DriveFile = {
  /** Stable across renders. A file that keeps its id but changes folder slides to its new place. */
  id: string;
  name: string;
  /** Taken from the extension when left out. */
  kind?: FileKind;
  modified: string;
  owner?: string;
  size?: string;
  status?: DocumentStatus;
  /** Highlights the row with a "New" badge and plays its entrance, for a file that just landed. */
  isNew?: boolean;
  /** Highlights the row without a badge, for example while it moves. */
  highlight?: boolean;
};

export const driveColumns = "grid-cols-[minmax(0,1fr)_auto] gap-x-3 @2xl:grid-cols-[minmax(0,1fr)_8rem_9rem_4.5rem]";

/** A long name may wrap after "_" or "-", never inside a word: a hyphen already allows a break, `<wbr>` adds one after "_". */
function breakAfterUnderscores(name: string): ReactNode {
  const parts = name.split("_");
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <>
          _<wbr />
        </>
      )}
    </Fragment>
  ));
}

/** `wrapName` breaks a long name over lines instead of cutting it, for narrow lanes where the end of the name matters. */
export function DriveFileRow({ file, compact, wrapName }: { file: DriveFile; compact?: boolean; wrapName?: boolean }) {
  const lit = file.isNew === true || file.highlight === true;
  const cellRole = compact ? undefined : "cell";
  return (
    <motion.div
      layout="position"
      layoutId={`drive-file-${file.id}`}
      transition={{ type: "spring", duration: 0.7, bounce: 0.12 }}
      role={compact ? "treeitem" : "row"}
      className={cx(
        "grid items-center rounded-lg px-2",
        compact ? "grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2" : cx(driveColumns, "py-2.5"),
        lit ? "bg-brand-soft shadow-[inset_0_0_0_1px_var(--brand-line)]" : "shadow-[0_-1px_0_var(--border)]",
        file.isNew && "enter",
      )}
    >
      <span role={cellRole} className="flex min-w-0 items-center gap-3">
        <FileIcon kind={file.kind ?? fileKindOf(file.name)} size={compact ? 22 : 26} />
        <span className="min-w-0 flex-1">
          <span className={cx("block text-body font-medium text-foreground", wrapName ? "wrap-normal" : "truncate")}>
            {wrapName ? breakAfterUnderscores(file.name) : file.name}
          </span>
          {(file.isNew === true || file.status !== undefined) && (
            <span className="mt-1 flex flex-wrap gap-1.5">
              {file.isNew && <Badge tone="brand">New</Badge>}
              {file.status && <StatusBadge status={file.status} />}
            </span>
          )}
        </span>
      </span>
      {!compact && <span role={cellRole} className="hidden truncate text-body text-muted @2xl:block">{file.owner ?? "me"}</span>}
      <span role={cellRole} className={cx("tabular truncate text-right text-meta text-muted", !compact && "@2xl:text-left @2xl:text-body")}>
        {file.modified}
      </span>
      {!compact && <span role={cellRole} className="tabular hidden text-right text-body text-muted @2xl:block">{file.size ?? ""}</span>}
    </motion.div>
  );
}
