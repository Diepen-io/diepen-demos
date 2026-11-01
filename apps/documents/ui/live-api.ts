import type { CheckResult } from "@/domain/check-result";
import type { LiveSession } from "@/domain/live-session";
import type { OutstandingEntry } from "@/domain/chase-emails";
import type { ChaseKind } from "@/domain/live-session";
import type { UploadItemId } from "@/domain/document-request";
import { readFallback } from "@diepen/ai/text-stream-client";
import type { CompanyProfile } from "@diepen/voice/profile";

/** The browser side of `/api/check` and `/api/chase`. A tripped cost guard comes back as `fallback`. */

export type CheckAnswer = {
  check: CheckResult;
  itemEvent: "checkPassed" | "checkFailed";
  filing: { folder: string; fileName: string };
  provider: "claude" | "mock";
  ocr: "claude" | "google-document-ai";
};

export type SentChase = {
  id: string;
  kind: ChaseKind;
  to: "client" | "firm";
  sentAt: string;
  subject: string;
  body: string;
  outstanding: OutstandingEntry[];
};

export type ChaseAnswer = { session: LiveSession; sent: SentChase[] };

export type ApiOutcome<T> = { kind: "ok"; answer: T } | { kind: "fallback" } | { kind: "failed" };

async function outcomeOf<T>(request: Promise<Response>): Promise<ApiOutcome<T>> {
  try {
    const response = await request;
    if (response.ok) return { kind: "ok", answer: (await response.json()) as T };
    return (await readFallback(response)) ? { kind: "fallback" } : { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}

export async function postCheck(file: File, itemId: UploadItemId, profile: CompanyProfile): Promise<ApiOutcome<CheckAnswer>> {
  const form = new FormData();
  form.append("itemId", itemId);
  form.append("profile", JSON.stringify(profile));
  form.append("file", file);
  // Sent as bytes, not as a form that points at the file, so the request is complete in memory
  // and browser tools can show what was sent.
  const encoded = new Response(form);
  const body = await encoded.arrayBuffer();
  const headers = { "content-type": encoded.headers.get("content-type") ?? "multipart/form-data" };
  return outcomeOf(fetch("/api/check", { method: "POST", body, headers }));
}

export function postChase(session: LiveSession, event: "submitted" | "skip-days", profile: CompanyProfile): Promise<ApiOutcome<ChaseAnswer>> {
  return outcomeOf(
    fetch("/api/chase", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session, event, profile }),
    }),
  );
}

/** A sample from `public/fixtures/`, as a `File` with its own name, so it travels like an upload. */
export async function sampleFile(fileName: string): Promise<File | null> {
  try {
    const response = await fetch(`/fixtures/${fileName}`);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch {
    return null;
  }
}
