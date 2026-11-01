import { liveSessionSchema } from "@/domain/live-session";
import { container } from "@/infrastructure/container";
import { BodyTooLargeError, readBodyText } from "@diepen/ai/request-body";
import { companyProfileSchema } from "@diepen/voice/profile";
import { defaultPresetFor } from "@diepen/voice/presets";
import { z } from "zod";

/** A session of six items with a few chases fits easily; anything larger is not this demo's. */
const maxBodyBytes = 65_536;

const bodySchema = z.object({
  session: liveSessionSchema,
  event: z.enum(["submitted", "skip-days"]),
  profile: companyProfileSchema.optional(),
});

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

const tooLarge = () => json({ error: "body_too_large", maxBytes: maxBodyBytes }, 413);

const invalid = (issues: string[]) => json({ error: "invalid_request", issues }, 400);

/** "Done for now" and "Skip 3 days". No AI call, so no cost guard: it only validates and limits its body. */
export async function POST(request: Request): Promise<Response> {
  let text: string;
  try {
    text = await readBodyText(request, maxBodyBytes);
  } catch (error) {
    if (error instanceof BodyTooLargeError) return tooLarge();
    throw error;
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return invalid(["The body must be JSON."]);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return invalid(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));

  const { session, event, profile } = parsed.data;
  return json(await container.runChase(session, profile ?? defaultPresetFor("documents"), event));
}
