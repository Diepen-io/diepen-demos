import { z } from "zod";

/**
 * What one document check found. The same shape as the voice task's `DocumentCheck`; the domain
 * keeps its own copy because it imports nothing but the profile, and a type test keeps the two equal.
 */

export const issueKinds = [
  "missing_page",
  "missing_signature",
  "wrong_year",
  "wrong_person",
  "wrong_document",
  "unreadable",
  "other",
] as const;

export type IssueKind = (typeof issueKinds)[number];

export const checkResultSchema = z.object({
  documentType: z.string(),
  matchesRequest: z.boolean(),
  person: z.string().nullable(),
  year: z.number().int().nullable(),
  pageCount: z.number().int().optional(),
  signed: z.boolean().optional(),
  issues: z.array(z.object({ kind: z.enum(issueKinds), detail: z.string() })),
  keyFigures: z.array(z.object({ label: z.string(), value: z.string() })),
  summary: z.string(),
  status: z.enum(["ok", "problem"]),
});

export type CheckResult = z.infer<typeof checkResultSchema>;

export type CheckIssue = CheckResult["issues"][number];
