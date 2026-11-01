"use client";

import { LayoutGroup, MotionConfig } from "motion/react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";
import { DriveFileRow, driveColumns, type DriveFile } from "./drive-file-row";

export type { DriveFile } from "./drive-file-row";

export type DriveSubfolder = {
  /** Numbered names sort like a real filing system, for example "01 Income" or "99 Replaced". */
  name: string;
  /** Shown as a count when the files are not listed. */
  items?: number;
  /** With files, the folder shows as an open branch of a tree with its files under it. */
  files?: DriveFile[];
};

export type DriveFolderProps = {
  /** Breadcrumb from the drive root, for example ["My Drive", "Clients", "Hoffmann 2025"]. */
  path: string[];
  folders?: DriveSubfolder[];
  /** Files directly in this folder. */
  files?: DriveFile[];
  className?: string;
};

function FolderGlyph() {
  return <Icon name="folder" size={20} className="shrink-0 fill-[#a1a1aa] text-[#a1a1aa]" />;
}

/**
 * A cloud folder. Subfolders with `files` render as a tree, and a file that moves between
 * them (same id, new folder) slides there, as when an old version goes to "99 Replaced".
 */
export function DriveFolder({ path, folders = [], files = [], className }: DriveFolderProps) {
  const tree = folders.some((folder) => folder.files);
  const count = files.length + folders.reduce((sum, folder) => sum + (folder.files?.length ?? 0), 0);

  return (
    <ChannelFrame channel="Drive" icon="folder" accent="var(--channel-drive)" meta={`${count} files`} className={className}>
      <nav aria-label="Folder path" className="flex min-w-0 items-center gap-1 border-b border-border px-4 py-3">
        {path.map((part, index) => {
          const current = index === path.length - 1;
          return (
            <span key={`${part}-${index}`} className={cx("flex items-center gap-1", current ? "min-w-0" : "hidden shrink-0 @md:flex")}>
              {index > 0 && <Icon name="chevronRight" size={16} className={cx("shrink-0 text-faint", current && "hidden @md:block")} />}
              <span className={cx("truncate", current ? "text-lg font-medium text-foreground" : "text-[15px] text-muted")}>{part}</span>
            </span>
          );
        })}
      </nav>

      <MotionConfig reducedMotion="user">
        <LayoutGroup>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {tree ? (
              <ul role="tree" aria-label="Folders" className="flex flex-col gap-1 pt-2">
                {folders.map((folder) => (
                  <li key={folder.name} role="treeitem" aria-expanded={Boolean(folder.files)} className="flex flex-col">
                    <div className="flex items-center gap-2 rounded-lg px-2 py-2">
                      <Icon name="chevronRight" size={14} className={cx("shrink-0 text-faint transition-transform", folder.files && "rotate-90")} />
                      <FolderGlyph />
                      <span className="min-w-0 flex-1 truncate text-body font-medium">{folder.name}</span>
                      <span className="tabular text-meta text-faint">{folder.files?.length ?? folder.items ?? 0}</span>
                    </div>
                    {folder.files && folder.files.length > 0 && (
                      <div role="group" className="ml-[1.375rem] flex flex-col border-l border-border pl-3">
                        {folder.files.map((file) => (
                          <DriveFileRow key={file.id} file={file} compact />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              folders.length > 0 && (
                <>
                  <h4 className="px-2 pt-3 pb-2 text-meta font-medium text-muted">Folders</h4>
                  <ul className="grid grid-cols-1 gap-2 px-2 @sm:grid-cols-2 @3xl:grid-cols-4">
                    {folders.map((folder) => (
                      <li key={folder.name} className="flex items-center gap-3 rounded-xl bg-subtle px-3 py-2.5">
                        <FolderGlyph />
                        <span className="min-w-0 flex-1 truncate text-body font-medium">{folder.name}</span>
                        {folder.items !== undefined && <span className="tabular text-meta text-faint">{folder.items}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )
            )}

            {files.length > 0 && (
              <>
                <h4 className="px-2 pt-4 pb-1 text-meta font-medium text-muted">Files</h4>
                <div role="table" aria-label="Files" className="flex flex-col">
                  <div role="row" className={cx(driveColumns, "hidden px-2 py-2 text-meta font-medium text-muted @2xl:grid")}>
                    <span role="columnheader">Name</span>
                    <span role="columnheader">Owner</span>
                    <span role="columnheader">Last modified</span>
                    <span role="columnheader" className="text-right">Size</span>
                  </div>
                  {files.map((file) => (
                    <DriveFileRow key={file.id} file={file} />
                  ))}
                </div>
              </>
            )}
          </div>
        </LayoutGroup>
      </MotionConfig>
    </ChannelFrame>
  );
}
