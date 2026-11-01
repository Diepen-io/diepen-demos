import type { CheckResult } from "@/domain/check-result";
import { createTaxReturnRequest, requestSentAt, type ItemId, type RequestItem, type UploadItemId } from "@/domain/document-request";
import { createDriveTree, type DriveTree } from "@/domain/drive-folder";
import type { LiveSession } from "@/domain/live-session";
import type { DocumentsLaneId } from "./documents-lanes";
import type { InboxEmail } from "./email-views";
import type { LetterSignature } from "./engagement-letter";

/** Everything the live page holds. It lives in browser memory only: a reload or "Start over" begins again. */

export type LiveCheck = { id: string; itemId: UploadItemId; fileName: string; phase: "reading" | "done" | "aborted"; result?: CheckResult };

export type FeedEntry = { kind: "check"; id: string } | { kind: "chase"; id: string };

export type ClientScreen = "inbox" | "email" | "upload" | "letter";

export type LiveState = {
  items: RequestItem[];
  results: Partial<Record<ItemId, CheckResult>>;
  checks: LiveCheck[];
  feed: FeedEntry[];
  drive: DriveTree;
  filedAt: Record<string, string>;
  emails: InboxEmail[];
  chasesSent: { id: string; title: string; sentAt: string }[];
  screen: ClientScreen;
  openEmailId?: string;
  signature?: LetterSignature;
  rowErrors: Partial<Record<ItemId, string>>;
  lastFile: Partial<Record<UploadItemId, string>>;
  session: Omit<LiveSession, "items" | "now">;
  escalation?: { subject: string; body: string };
  /** The story clock, minute precision. */
  now: string;
  /** Lanes that changed since their tab was last open, for the dots on a phone. */
  changed: DocumentsLaneId[];
};

/** Daniel opens the email at lunch on Monday; live mode starts there. */
export const liveStartsAt = "2026-03-09T12:40";

export function initialLiveState(requestEmail: InboxEmail): LiveState {
  return {
    items: createTaxReturnRequest(requestSentAt).items,
    results: {},
    checks: [],
    feed: [],
    drive: createDriveTree(),
    filedAt: {},
    emails: [requestEmail],
    chasesSent: [],
    screen: "inbox",
    rowErrors: {},
    lastFile: {},
    session: { requestId: "okafor-2025", sentAt: requestSentAt, chases: [], jobs: [], escalated: false },
    now: liveStartsAt,
    changed: [],
  };
}

/** The serialisable session `/api/chase` reads: states and what the checks found, no file content. */
export function sessionOf(state: LiveState, now = state.now): LiveSession {
  return {
    ...state.session,
    now,
    items: state.items.map((item) => {
      const result = item.state === "checked" || item.state === "problem" ? state.results[item.id] : undefined;
      return {
        id: item.id,
        state: item.state,
        issues: (result?.issues ?? []).map((issue) => ({ kind: issue.kind })),
        detectedYear: result?.year ?? null,
        detectedPerson: result?.person ?? null,
      };
    }),
  };
}
