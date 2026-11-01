import type { ItemId } from "./document-request";

/**
 * The client's Drive folder. A passing file goes to its item's folder, a problem file to
 * "00 Needs attention", and when an item passes, its earlier problem files move to "99 Replaced".
 * Every function returns a new tree.
 */

export const folderNames = [
  "00 Needs attention",
  "01 Engagement",
  "02 Income",
  "03 Bank",
  "04 Deductions",
  "05 Insurance",
  "99 Replaced",
] as const;

export type FolderName = (typeof folderNames)[number];

export const needsAttention: FolderName = "00 Needs attention";
export const replaced: FolderName = "99 Replaced";

export const itemFolders: Record<ItemId, FolderName> = {
  "engagement-letter": "01 Engagement",
  "payslip-summary": "02 Income",
  "bank-interest": "03 Bank",
  "donation-receipt": "04 Deductions",
  "home-office": "04 Deductions",
  "health-insurance": "05 Insurance",
};

export type DriveEntry = {
  /** Stable while the file moves between folders, so the screen can slide it. */
  id: string;
  name: string;
  itemId: ItemId;
  status: "ok" | "problem";
};

export type DriveTree = { folders: { name: FolderName; files: DriveEntry[] }[] };

export type Filing = { itemId: ItemId; fileName: string; status: "ok" | "problem" };

export function createDriveTree(): DriveTree {
  return { folders: folderNames.map((name) => ({ name, files: [] })) };
}

/** "My Drive / {firm} / Clients / Okafor, Daniel / 2025 Tax return". */
export function drivePath(firmName: string): string[] {
  return ["My Drive", firmName, "Clients", "Okafor, Daniel", "2025 Tax return"];
}

export function folderFor(filing: Pick<Filing, "itemId" | "status">): FolderName {
  return filing.status === "ok" ? itemFolders[filing.itemId] : needsAttention;
}

/** "name.pdf", then "name_2.pdf", "name_3.pdf" while the name is taken. */
function freeName(name: string, taken: readonly DriveEntry[]): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : "";
  const names = new Set(taken.map((entry) => entry.name));
  let candidate = name;
  for (let copy = 2; names.has(candidate); copy++) candidate = `${stem}_${copy}${extension}`;
  return candidate;
}

const byName = (a: DriveEntry, b: DriveEntry) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

function withFiles(tree: DriveTree, folder: FolderName, files: DriveEntry[]): DriveTree {
  return {
    folders: tree.folders.map((entry) => (entry.name === folder ? { name: folder, files: [...files].sort(byName) } : entry)),
  };
}

function filesIn(tree: DriveTree, folder: FolderName): DriveEntry[] {
  return tree.folders.find((entry) => entry.name === folder)?.files ?? [];
}

function fileCount(tree: DriveTree): number {
  return tree.folders.reduce((sum, folder) => sum + folder.files.length, 0);
}

function moveReplacedFiles(tree: DriveTree, itemId: ItemId): DriveTree {
  const waiting = filesIn(tree, needsAttention);
  const moving = waiting.filter((entry) => entry.itemId === itemId);
  if (moving.length === 0) return tree;
  const archive = [...filesIn(tree, replaced)];
  for (const entry of moving) archive.push({ ...entry, name: freeName(entry.name, archive) });
  const kept = waiting.filter((entry) => entry.itemId !== itemId);
  return withFiles(withFiles(tree, needsAttention, kept), replaced, archive);
}

export function fileIntoDrive(tree: DriveTree, filing: Filing): DriveTree {
  const id = `file-${fileCount(tree) + 1}`;
  const sorted = filing.status === "ok" ? moveReplacedFiles(tree, filing.itemId) : tree;
  const folder = folderFor(filing);
  const present = filesIn(sorted, folder);
  const entry: DriveEntry = { id, name: freeName(filing.fileName, present), itemId: filing.itemId, status: filing.status };
  return withFiles(sorted, folder, [...present, entry]);
}

/** The newest file of the tree, which the screen highlights. */
export function newestEntryId(tree: DriveTree): string | undefined {
  const count = fileCount(tree);
  return count > 0 ? `file-${count}` : undefined;
}
