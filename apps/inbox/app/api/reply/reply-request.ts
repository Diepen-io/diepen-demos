import { BodyTooLargeError, readBodyText } from "@diepen/ai/request-body";
import { companyProfileSchema } from "@diepen/voice/profile";
import { z } from "zod";
import { channelSchema } from "@/domain/channel";

/** The largest body `/api/reply` reads. A profile and twenty short messages fit well inside it. */
export const maxReplyRequestBytes = 32 * 1024;

const wallClockTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Use a local time like 2026-11-12T09:00");

const turn = z.object({
  role: z.enum(["customer", "assistant"]),
  text: z.string().trim().min(1).max(1000),
});

export const replyRequestSchema = z.object({
  channel: channelSchema,
  profile: companyProfileSchema,
  messages: z
    .array(turn)
    .min(1)
    .max(20)
    .refine((messages) => messages.at(-1)?.role === "customer", "The last message must come from the customer"),
  bookings: z.array(wallClockTime).max(20),
  offeredSlots: z.array(wallClockTime).max(3),
  now: wallClockTime,
});

export type ReplyRequest = z.infer<typeof replyRequestSchema>;

export type ReplyRequestResult =
  | { success: true; data: ReplyRequest }
  | { success: false; issues: { message: string; path: PropertyKey[] }[] };

/** Reads and validates the body. The size cap holds while the body streams in, before it parses JSON. */
export async function readReplyRequest(request: Request): Promise<ReplyRequestResult> {
  let text: string;
  try {
    text = await readBodyText(request, maxReplyRequestBytes);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return { success: false, issues: [{ message: "The request is larger than 32 KB", path: [] }] };
    }
    throw error;
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { success: false, issues: [{ message: "The body is not JSON", path: [] }] };
  }
  const parsed = replyRequestSchema.safeParse(json);
  return parsed.success ? { success: true, data: parsed.data } : { success: false, issues: parsed.error.issues };
}
