"use client";

import { drivePath, needsAttention, newestEntryId, replaced, type DriveTree } from "@/domain/drive-folder";
import { DriveFolder } from "@diepen/ui/mockups/drive-folder";
import { useLayoutEffect, useRef } from "react";

export type DriveLaneProps = {
  firmName: string;
  tree: DriveTree;
  /** When each file landed, as the story clock read it, for example "12:42". */
  filedAt: Record<string, string>;
  /** The file that just landed. It shows a "New" badge. */
  freshId?: string;
};

/**
 * A long file name may wrap only after "_" or "-", never inside a word. A hyphen already allows a
 * break; a zero-width space after each underscore adds one there.
 */
export function wrappableFileName(name: string): string {
  return name.replaceAll("_", "_\u200b");
}

/**
 * Keeps the newest file in view. Once "99 Replaced" holds files, the view starts from the end of
 * the tree, where they are, and only moves up if the newest file would be out of sight.
 */
function useFollowNewest(tree: DriveTree, folders: { files: { id: string }[] }[]) {
  const box = useRef<HTMLDivElement>(null);
  const newestId = newestEntryId(tree);
  const toEnd = tree.folders.some((folder) => folder.name === replaced && folder.files.length > 0);
  const folderIndex = folders.findIndex((folder) => folder.files.some((file) => file.id === newestId));
  const fileIndex = folders[folderIndex]?.files.findIndex((file) => file.id === newestId) ?? -1;

  useLayoutEffect(() => {
    const treeElement = box.current?.querySelector('[role="tree"]');
    const scroller = treeElement?.parentElement;
    if (!treeElement || !scroller || newestId === undefined) return;
    let goal = toEnd ? scroller.scrollHeight - scroller.clientHeight : scroller.scrollTop;
    const row = treeElement.children[folderIndex]?.querySelector('[role="group"]')?.children[fileIndex];
    if (row) {
      // On a short screen the lane is zoomed: boxes come in screen pixels, scrolling in the lane's own.
      const scale = scroller.getBoundingClientRect().height / scroller.offsetHeight || 1;
      const rowBox = row.getBoundingClientRect();
      const top = (rowBox.top - scroller.getBoundingClientRect().top) / scale + scroller.scrollTop;
      const bottom = top + rowBox.height / scale;
      if (top < goal) goal = top - 48;
      else if (bottom > goal + scroller.clientHeight) goal = bottom - scroller.clientHeight + 12;
    }
    scroller.scrollTo({ top: Math.max(0, goal), behavior: "smooth" });
  }, [newestId, toEnd, folderIndex, fileIndex]);

  return box;
}

/** The client folder in Drive. "00 Needs attention" and "99 Replaced" show only when they hold files. */
export function DriveLane({ firmName, tree, filedAt, freshId }: DriveLaneProps) {
  const folders = tree.folders
    .filter((folder) => folder.files.length > 0 || (folder.name !== needsAttention && folder.name !== replaced))
    .map((folder) => ({
      name: folder.name,
      files: folder.files.map((entry) => ({
        id: entry.id,
        name: wrappableFileName(entry.name),
        modified: filedAt[entry.id] ?? "",
        isNew: entry.id === freshId,
      })),
    }));
  const box = useFollowNewest(tree, folders);
  return (
    <div ref={box} className="drive-lane lane-dense h-full min-h-0">
      <DriveFolder path={drivePath(firmName)} folders={folders} wrapNames />
    </div>
  );
}
