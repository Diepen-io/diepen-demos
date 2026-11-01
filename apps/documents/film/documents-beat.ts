import type { ItemEvent } from "@/domain/checklist";
import type { ItemId, UploadItemId } from "@/domain/document-request";

/**
 * What one film beat changes. Every beat is data; `film-state.ts` folds the landed beats with the
 * domain functions, so a seek shows the same frame as playing to that moment.
 */

export type ChecklistChange = { itemId: ItemId; event: ItemEvent };

export type DocumentsBeat =
  /** The firm's checklist appears, or some of its rows change. */
  | { kind: "checklist"; changes: ChecklistChange[] }
  /** An email reaches the client's inbox, and opens when `open` is true. */
  | { kind: "email"; email: "request" | "follow-up" | "reminder"; open: boolean }
  /** The client opens the upload page. */
  | { kind: "upload-page" }
  /** The client signs the engagement letter. */
  | { kind: "signature" }
  /** Files fill their slots on the upload page. */
  | { kind: "files-dropped"; files: { itemId: UploadItemId; fileName: string }[] }
  /** A file reaches the system (`arrived`), or its recorded check result shows (`result`). */
  | { kind: "check"; fileNames: string[]; step: "arrived" | "result"; compact?: boolean }
  /** A file lands in Drive, named and sorted. */
  | { kind: "filed"; itemId: ItemId; fileName: string; status: "ok" | "problem" }
  /** The firm's one-card summary. */
  | { kind: "summary" }
  /** The next chase and the 3 day bar. */
  | { kind: "schedule"; title: string; from: string; dueAt: string }
  /** The checklist is complete. */
  | { kind: "complete" };
