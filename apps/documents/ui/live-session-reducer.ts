import { anyFileReceived } from "@/domain/chase-emails";
import { transition, type ItemEvent } from "@/domain/checklist";
import { fileIntoDrive, newestEntryId } from "@/domain/drive-folder";
import type { ItemId, UploadItemId } from "@/domain/document-request";
import type { DocumentsLaneId } from "./documents-lanes";
import type { LetterSignature } from "./engagement-letter";
import type { CheckAnswer, ChaseAnswer } from "./live-api";
import { initialLiveState, type ClientScreen, type LiveState } from "./live-state";

export type LiveAction =
  | { type: "show"; screen: ClientScreen }
  | { type: "open-email"; id: string }
  | { type: "signed"; signature: LetterSignature }
  | { type: "file-rejected"; itemId: UploadItemId; message: string }
  | { type: "check-started"; checkId: string; itemId: UploadItemId; fileName: string }
  | { type: "check-finished"; checkId: string; answer: CheckAnswer }
  | { type: "check-aborted"; checkId: string }
  | { type: "chase-answered"; answer: ChaseAnswer; event: "submitted" | "skip-days" }
  | { type: "tick"; now: string }
  | { type: "seen"; lane: DocumentsLaneId }
  | { type: "reset" };

export const abortedMessage = "The check did not finish. Upload the file again.";

function withEvent(state: LiveState, itemId: ItemId, event: ItemEvent): LiveState["items"] {
  return state.items.map((item) => (item.id === itemId ? transition(item, event).item : item));
}

function touch(state: LiveState, ...lanes: DocumentsLaneId[]): DocumentsLaneId[] {
  return [...new Set([...state.changed, ...lanes])];
}

function fileEntry(state: LiveState, filing: Parameters<typeof fileIntoDrive>[1]): Pick<LiveState, "drive" | "filedAt"> {
  const drive = fileIntoDrive(state.drive, filing);
  const id = newestEntryId(drive);
  return { drive, filedAt: id ? { ...state.filedAt, [id]: state.now.slice(11, 16) } : state.filedAt };
}

export function liveReducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "show":
      return { ...state, screen: action.screen };
    case "open-email":
      return {
        ...state,
        screen: "email",
        openEmailId: action.id,
        emails: state.emails.map((email) => (email.id === action.id ? { ...email, unread: false, fresh: false } : email)),
      };
    case "signed":
      return {
        ...state,
        ...fileEntry(state, { itemId: "engagement-letter", fileName: "2025_Okafor-Daniel_Engagement-letter_signed.pdf", status: "ok" }),
        items: withEvent(state, "engagement-letter", "signed"),
        signature: action.signature,
        screen: "upload",
        changed: touch(state, "firm", "drive"),
      };
    case "file-rejected":
      return { ...state, rowErrors: { ...state.rowErrors, [action.itemId]: action.message } };
    case "check-started":
      return {
        ...state,
        items: withEvent(state, action.itemId, "uploaded"),
        checks: [...state.checks, { id: action.checkId, itemId: action.itemId, fileName: action.fileName, phase: "reading" }],
        feed: [...state.feed, { kind: "check", id: action.checkId }],
        rowErrors: { ...state.rowErrors, [action.itemId]: undefined },
        lastFile: { ...state.lastFile, [action.itemId]: action.fileName },
        changed: touch(state, "firm", "system"),
      };
    case "check-finished": {
      const check = state.checks.find((entry) => entry.id === action.checkId);
      if (!check) return state;
      const { answer } = action;
      const status = answer.itemEvent === "checkPassed" ? "ok" : "problem";
      return {
        ...state,
        ...fileEntry(state, { itemId: check.itemId, fileName: answer.filing.fileName, status }),
        items: withEvent(state, check.itemId, answer.itemEvent),
        results: { ...state.results, [check.itemId]: answer.check },
        checks: state.checks.map((entry) => (entry.id === check.id ? { ...entry, phase: "done", result: answer.check } : entry)),
        changed: touch(state, "firm", "system", "drive"),
      };
    }
    case "check-aborted": {
      const check = state.checks.find((entry) => entry.id === action.checkId);
      if (!check) return state;
      return {
        ...state,
        items: withEvent(state, check.itemId, "checkAborted"),
        checks: state.checks.map((entry) => (entry.id === check.id ? { ...entry, phase: "aborted" } : entry)),
        rowErrors: { ...state.rowErrors, [check.itemId]: abortedMessage },
      };
    }
    case "chase-answered": {
      const { session, sent } = action.answer;
      const escalation = sent.find((chase) => chase.kind === "escalation");
      const received = anyFileReceived(state.items);
      const emails = sent.flatMap((chase) =>
        chase.kind === "escalation"
          ? []
          : [{ id: chase.id, kind: chase.kind, sentAt: chase.sentAt, outstanding: chase.outstanding, anyFileReceived: received, unread: true, fresh: true }],
      );
      // "Done for now" sends the follow-up at once; everything after it waits for its day.
      const chases = sent.map((chase) => ({
        id: chase.id,
        kind: chase.kind,
        sentAt: chase.sentAt,
        trigger: action.event === "submitted" ? ("done" as const) : ("schedule" as const),
      }));
      return {
        ...state,
        session: { requestId: session.requestId, sentAt: session.sentAt, submittedAt: session.submittedAt, chases: session.chases, jobs: session.jobs, escalated: session.escalated },
        now: session.now,
        emails: [...state.emails, ...emails],
        chasesSent: [...state.chasesSent, ...chases],
        feed: [...state.feed, ...chases.map((chase) => ({ kind: "chase" as const, id: chase.id }))],
        screen: emails.length > 0 ? "inbox" : state.screen,
        escalation: escalation ? { outstanding: escalation.outstanding } : state.escalation,
        changed: touch(state, "system", ...(emails.length > 0 ? (["client"] as const) : []), ...(escalation ? (["firm"] as const) : [])),
      };
    }
    case "tick":
      return action.now === state.now ? state : { ...state, now: action.now };
    case "seen":
      return state.changed.includes(action.lane) ? { ...state, changed: state.changed.filter((lane) => lane !== action.lane) } : state;
    case "reset":
      return initialLiveState();
  }
}
