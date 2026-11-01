import { isAiError } from "@diepen/ai/errors";
import { BodyTooLargeError, readBodyText } from "@diepen/ai/request-body";
import { fallbackResponse, unavailableResponse } from "@diepen/ai/route-responses";
import { defaultPresetFor } from "@diepen/voice/presets";
import { container } from "@/infrastructure/container";
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
  let raw: string;
  try {
    raw = await readBodyText(request, maxBodyBytes);
  } catch (error) {
    if (error instanceof BodyTooLargeError) return json({ error: "too_large" }, 413);
    throw error;
  }

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

  const guard = container.guards.check(request);
  if (!guard.ok) return fallbackResponse(guard);

  const { transcript, profile, localNow } = parsed.data;
  try {
    const outputs = await container.processCall({ transcript, profile: profile ?? defaultPresetFor("meetings"), localNow });
    return json({ outputs, provider: container.providerName });
  } catch (error) {
    if (isAiError(error)) return unavailableResponse(error);
    throw error;
  }
}
