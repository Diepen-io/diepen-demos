import { transition } from "@/domain/checklist";
import { createTaxReturnRequest, requestSentAt, type ItemId, type RequestItem, type UploadItemId } from "@/domain/document-request";
import { createDriveTree, fileIntoDrive, newestEntryId, type DriveTree } from "@/domain/drive-folder";
import { beatArrival, type FilmBeat } from "@diepen/ui/film/film-script";
import type { DocumentsBeat } from "./documents-beat";

/** Everything the four lanes show at one moment, folded from the beats that have landed. */

export type ClientScreen = "inbox" | "email" | "upload" | "letter";

export type FilmState = {
  checklist: RequestItem[];
  /** When each row last changed, in film ms, so a fresh change can pop. */
  rowChangedAt: Partial<Record<ItemId, number>>;
  drive: DriveTree;
  /** Film ms at which each Drive entry landed. */
  filedAt: Record<string, number>;
  checks: { fileName: string; arrivedAt: number; resultAt?: number; compact: boolean }[];
  client: {
    screen: ClientScreen;
    screenSince: number;
    emails: { kind: "request" | "follow-up" | "reminder"; arrivedAt: number }[];
    openEmail?: "request" | "follow-up" | "reminder";
    signedAt?: number;
    /** The latest file put in each slot, and when. */
    dropped: Partial<Record<UploadItemId, { fileName: string; at: number }>>;
  };
  summaryAt?: number;
  schedule?: { title: string; from: string; dueAt: string; at: number };
  completeAt?: number;
};

export function initialFilmState(): FilmState {
  return {
    checklist: createTaxReturnRequest(requestSentAt).items,
    rowChangedAt: {},
    drive: createDriveTree(),
    filedAt: {},
    checks: [],
    client: { screen: "inbox", screenSince: 0, emails: [], dropped: {} },
  };
}

function showScreen(state: FilmState, screen: ClientScreen, at: number): FilmState["client"] {
  return { ...state.client, screen, screenSince: at };
}

function applyBeat(state: FilmState, beat: FilmBeat<DocumentsBeat>): FilmState {
  const at = beatArrival(beat);
  const data = beat.data;
  switch (data.kind) {
    case "checklist": {
      let checklist = state.checklist;
      const rowChangedAt = { ...state.rowChangedAt };
      for (const change of data.changes) {
        checklist = checklist.map((item) => (item.id === change.itemId ? transition(item, change.event).item : item));
        rowChangedAt[change.itemId] = at;
      }
      return { ...state, checklist, rowChangedAt };
    }
    case "email": {
      const emails = state.client.emails.some((email) => email.kind === data.email)
        ? state.client.emails
        : [...state.client.emails, { kind: data.email, arrivedAt: at }];
      const client = data.open ? { ...showScreen(state, "email", at), openEmail: data.email } : showScreen(state, "inbox", at);
      return { ...state, client: { ...client, emails } };
    }
    case "upload-page":
      return { ...state, client: showScreen(state, "upload", at) };
    case "signature":
      return { ...state, client: { ...showScreen(state, "letter", at), signedAt: at } };
    case "files-dropped": {
      const dropped = { ...state.client.dropped };
      for (const file of data.files) dropped[file.itemId] = { fileName: file.fileName, at };
      return { ...state, client: { ...showScreen(state, "upload", at), dropped } };
    }
    case "check": {
      if (data.step === "arrived") {
        const added = data.fileNames.map((fileName) => ({ fileName, arrivedAt: at, compact: Boolean(data.compact) }));
        return { ...state, checks: [...state.checks, ...added] };
      }
      const checks = state.checks.map((check) =>
        data.fileNames.includes(check.fileName) ? { ...check, resultAt: at, compact: Boolean(data.compact) } : check,
      );
      return { ...state, checks };
    }
    case "filed": {
      const drive = fileIntoDrive(state.drive, { itemId: data.itemId, fileName: data.fileName, status: data.status });
      const id = newestEntryId(drive);
      return { ...state, drive, filedAt: id ? { ...state.filedAt, [id]: at } : state.filedAt };
    }
    case "summary":
      return { ...state, summaryAt: at };
    case "schedule":
      return { ...state, schedule: { title: data.title, from: data.from, dueAt: data.dueAt, at } };
    case "complete":
      return { ...state, completeAt: at };
  }
}

/** Folds landed beats in the order they landed. */
export function foldBeats(beats: readonly FilmBeat<DocumentsBeat>[]): FilmState {
  return [...beats].sort((a, b) => beatArrival(a) - beatArrival(b)).reduce(applyBeat, initialFilmState());
}
