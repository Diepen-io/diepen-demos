import { companyProfileSchema } from "@diepen/voice/profile";
import { z } from "zod";
import { checkTranscript, transcriptLimits, transcriptMessages } from "@/domain/transcript";

/** The largest request body the route reads, checked before JSON parsing. */
export const maxBodyBytes = 100 * 1024;

export const outputsRequestSchema = z.object({
  transcript: z
    .string()
    .trim()
    .max(transcriptLimits.maxCharacters, transcriptMessages.too_long)
    .superRefine((text, context) => {
      for (const issue of checkTranscript(text)) {
        if (issue.kind !== "too_long") context.addIssue({ code: "custom", message: issue.message });
      }
    }),
  // Absent means the default meetings preset.
  profile: companyProfileSchema.optional(),
  // The visitor's wall clock, so "Friday at ten" resolves in their week.
  localNow: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "Send the local time as YYYY-MM-DDTHH:MM:SS."),
});

export type OutputsRequest = z.infer<typeof outputsRequestSchema>;
