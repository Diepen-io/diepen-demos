import { liveSessionSchema } from "@/domain/live-session";
import { runChase } from "@/infrastructure/container";
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
  if (Number(request.headers.get("content-length") ?? 0) > maxBodyBytes) return tooLarge();
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBodyBytes) return tooLarge();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return invalid(["The body must be JSON."]);
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return invalid(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));

  const { session, event, profile } = parsed.data;
  return json(await runChase(session, profile ?? defaultPresetFor("documents"), event));
}
