import { isGuardTrip } from "@diepen/ai/text-stream-client";
import type { CompanyProfile } from "@diepen/voice/profile";
import { inboxReplySchema, type InboxReply } from "@diepen/voice/tasks/inbox-reply";
import { z } from "zod";
import type { Channel } from "@/domain/channel";

export type ReplyRequestBody = {
  channel: Channel;
  profile: CompanyProfile;
  messages: { role: "customer" | "assistant"; text: string }[];
  bookings: string[];
  offeredSlots: string[];
  now: string;
};

export type ReplyOutcome =
  | { kind: "reply"; reply: InboxReply; replyMs: number }
  /** A cost guard tripped: the app shows the film instead. */
  | { kind: "fallback" }
  /** Anything else, a failed model call included: the visitor sends the message again. */
  | { kind: "error" };

const responseSchema = z.object({ reply: inboxReplySchema, replyMs: z.number() });

/** Asks `/api/reply` for the next answer. Live mode reaches the server only through this. */
export async function requestReply(body: ReplyRequestBody): Promise<ReplyOutcome> {
  const started = performance.now();
  let response: Response;
  try {
    response = await fetch("/api/reply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { kind: "error" };
  }
  if (!response.ok) return (await isGuardTrip(response)) ? { kind: "fallback" } : { kind: "error" };
  const parsed = responseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return { kind: "error" };
  // The visitor waits for the whole round trip, so that is the reply time they see.
  const replyMs = Math.max(parsed.data.replyMs, performance.now() - started);
  return { kind: "reply", reply: parsed.data.reply, replyMs };
}

/** The visitor's local time as "2026-11-10T21:42", the clock the calendar and the model use. */
export function localNow(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
