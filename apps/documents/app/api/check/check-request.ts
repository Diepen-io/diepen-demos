import { isUploadItemId, type UploadItemId } from "@/domain/document-request";
import { companyProfileSchema, type CompanyProfile } from "@diepen/voice/profile";
import { defaultPresetFor } from "@diepen/voice/presets";
import { z } from "zod";

/** The multipart fields of `POST /api/check`, before the file's bytes are looked at. */

const profileField = z
  .string()
  .max(50_000)
  .transform((text, context) => {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      context.addIssue({ code: "custom", message: "profile is not JSON" });
      return z.NEVER;
    }
  })
  .pipe(companyProfileSchema);

const fieldsSchema = z.object({
  file: z.instanceof(File, { message: "file is required" }),
  itemId: z.string().refine(isUploadItemId, "itemId must be one of the five upload items"),
  profile: profileField.optional(),
});

export type CheckRequest = { file: File; itemId: UploadItemId; profile: CompanyProfile };

export function parseCheckForm(form: FormData): { ok: true; value: CheckRequest } | { ok: false; issues: string[] } {
  const parsed = fieldsSchema.safeParse({
    file: form.get("file") ?? undefined,
    itemId: form.get("itemId") ?? undefined,
    profile: form.get("profile") ?? undefined,
  });
  if (!parsed.success) return { ok: false, issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) };
  const { file, itemId, profile } = parsed.data;
  return { ok: true, value: { file, itemId, profile: profile ?? defaultPresetFor("documents") } };
}
