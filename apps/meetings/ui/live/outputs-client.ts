import { callOutputsSchema } from "@diepen/voice/tasks/call-outputs";
import type { CompanyProfile } from "@diepen/voice/profile";
import { z } from "zod";
import { dealStages } from "@/domain/deal-stage";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

const outputsSchema = callOutputsSchema.extend({
  crm: callOutputsSchema.shape.crm.extend({ stage: z.enum(dealStages) }),
});

const successSchema = z.object({ outputs: outputsSchema, provider: z.enum(["claude", "mock"]) });
const fallbackSchema = z.object({ fallback: z.literal("film") });

export type OutputsResult =
  | { kind: "outputs"; outputs: MeetingOutputs; provider: "claude" | "mock" }
  | { kind: "fallback" }
  | { kind: "failed" };

/** The visitor's wall clock as "2026-11-10T14:32:10", so the next meeting lands in their week. */
export function localNow(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Asks `/api/outputs` for the six outputs. Any answer the page cannot use counts as failed. */
export async function requestOutputs(
  input: { transcript: string; profile: CompanyProfile },
  signal?: AbortSignal,
): Promise<OutputsResult> {
  try {
    const response = await fetch("/api/outputs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...input, localNow: localNow() }),
      signal,
    });
    const body: unknown = await response.json().catch(() => null);
    if (response.ok) {
      const parsed = successSchema.safeParse(body);
      return parsed.success ? { kind: "outputs", ...parsed.data } : { kind: "failed" };
    }
    return fallbackSchema.safeParse(body).success ? { kind: "fallback" } : { kind: "failed" };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { kind: "failed" };
  }
}
