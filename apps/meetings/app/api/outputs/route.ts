import { fallbackResponse } from "@diepen/ai/route-responses";
import { defaultPresetFor } from "@diepen/voice/presets";
import { getContainer } from "@/infrastructure/container";
import { maxBodyBytes, outputsRequestSchema } from "./request-schema";

const noStore = { "cache-control": "no-store" };

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: noStore });
}

function invalid(issues: { path: string; message: string }[]): Response {
  return json({ error: "invalid_request", issues }, 400);
}

/** Turns a call transcript into the six outputs with one structured model call. */
export async function POST(request: Request): Promise<Response> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > maxBodyBytes) return json({ error: "too_large" }, 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) return json({ error: "too_large" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return invalid([{ path: "", message: "Send the request as JSON." }]);
  }
  const parsed = outputsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })));
  }

  const container = getContainer();
  const guard = container.guards.check(request);
  if (!guard.ok) return fallbackResponse(guard);

  const { transcript, profile, localNow } = parsed.data;
  try {
    const outputs = await container.processCall({ transcript, profile: profile ?? defaultPresetFor("meetings"), localNow });
    return json({ outputs, provider: container.providerName });
  } catch (error) {
    console.error("Call outputs failed", error);
    return json({ error: "generation_failed" }, 502);
  }
}
