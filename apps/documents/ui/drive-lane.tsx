import { drivePath, needsAttention, replaced, type DriveTree } from "@/domain/drive-folder";
import { DriveFolder } from "@diepen/ui/mockups/drive-folder";

export type DriveLaneProps = {
  firmName: string;
  tree: DriveTree;
  /** When each file landed, as the story clock read it, for example "12:42". */
  filedAt: Record<string, string>;
  /** The file that just landed. It shows a "New" badge. */
  freshId?: string;
};

/** The client folder in Drive. "00 Needs attention" and "99 Replaced" show only when they hold files. */
export function DriveLane({ firmName, tree, filedAt, freshId }: DriveLaneProps) {
  const folders = tree.folders
    .filter((folder) => folder.files.length > 0 || (folder.name !== needsAttention && folder.name !== replaced))
    .map((folder) => ({
      name: folder.name,
      files: folder.files.map((entry) => ({
        id: entry.id,
        name: entry.name,
        modified: filedAt[entry.id] ?? "",
        isNew: entry.id === freshId,
      })),
    }));
  return <DriveFolder path={drivePath(firmName)} folders={folders} wrapNames />;
}
