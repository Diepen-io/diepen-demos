import { acceptedMediaTypes, detectMediaType, maxUploadBytes, sniffLength } from "@/domain/file-type";
import { activeProviderName, checkDocument } from "@/infrastructure/container";
import { guards } from "@diepen/ai/guards";
import { fallbackResponse, unavailableResponse } from "@diepen/ai/route-responses";
import { parseCheckForm } from "./check-request";

/** One file plus the form fields; Vercel refuses bodies over 4.5 MB before the route runs. */
const maxBodyBytes = 4_400_000;

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

const tooLarge = () => json({ error: "file_too_large", maxBytes: maxUploadBytes }, 413);

/**
 * Checks one uploaded file. The bytes stay in this request's memory: they go to the OCR service
 * and the model and are dropped when the answer is sent.
 */
export async function POST(request: Request): Promise<Response> {
  if (Number(request.headers.get("content-length") ?? 0) > maxBodyBytes) return tooLarge();

  const form = await request.formData().catch(() => null);
  if (!form) return json({ error: "invalid_request", issues: ["The body must be multipart/form-data."] }, 400);
  const parsed = parseCheckForm(form);
  if (!parsed.ok) return json({ error: "invalid_request", issues: parsed.issues }, 400);

  const { file, itemId, profile } = parsed.value;
  if (file.size > maxUploadBytes) return tooLarge();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mediaType = detectMediaType(bytes.subarray(0, sniffLength));
  if (!mediaType) return json({ error: "unsupported_file_type", accepted: acceptedMediaTypes }, 415);

  const guard = guards.check(request);
  if (!guard.ok) return fallbackResponse(guard);

  try {
    const outcome = await checkDocument({
      file: { name: file.name, mediaType, bytes },
      itemId,
      profile,
      maxTokens: guards.clampMaxTokens(1200),
    });
    return json({ ...outcome, provider: activeProviderName() });
  } catch (error) {
    return unavailableResponse(error);
  }
}
