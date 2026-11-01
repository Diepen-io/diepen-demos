import { z } from "zod";
import { issueKinds } from "./check-result";
import { itemIds } from "./document-request";
import { isStoryTime } from "./story-time";

/**
 * The live demo's state as `/api/chase` reads and returns it. The server keeps nothing, so the
 * browser sends the whole session. It holds no file content and no check summaries.
 */

const storyTime = z.string().refine(isStoryTime, "Use a story time like 2026-03-09T12:40");

export const chaseKinds = ["follow-up", "reminder", "escalation"] as const;

export type ChaseKind = (typeof chaseKinds)[number];

const sessionItemSchema = z.object({
  id: z.enum(itemIds),
  state: z.enum(["missing", "received", "checked", "problem"]),
  issues: z.array(z.object({ kind: z.enum(issueKinds) })).max(10),
  detectedYear: z.number().int().nullable(),
  detectedPerson: z.string().max(200).nullable(),
});

export const liveSessionSchema = z.object({
  requestId: z.string().min(1).max(64),
  sentAt: storyTime,
  now: storyTime,
  submittedAt: storyTime.optional(),
  items: z.array(sessionItemSchema).max(itemIds.length),
  chases: z.array(z.object({ id: z.string().min(1).max(64), kind: z.enum(chaseKinds), sentAt: storyTime })).max(10),
  jobs: z.array(z.object({ id: z.string().min(1).max(64), runAt: storyTime })).max(10),
  escalated: z.boolean(),
});

export type LiveSession = z.infer<typeof liveSessionSchema>;

export type SessionItem = LiveSession["items"][number];
