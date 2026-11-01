import { isAiError } from "@diepen/ai/errors";
import { fallbackResponse, unavailableResponse } from "@diepen/ai/route-responses";
import { container } from "@/infrastructure/container";
import { readReplyRequest } from "./reply-request";

const noStore = { "cache-control": "no-store" };

/** One live turn: validate, run the cost guards, answer through the container. */
export async function POST(request: Request): Promise<Response> {
  const body = await readReplyRequest(request);
  if (!body.success) {
    return Response.json({ error: "invalid_request", issues: body.issues }, { status: 400, headers: noStore });
  }

  const guard = container.guards.check(request);
  if (!guard.ok) return fallbackResponse(guard);

  try {
    const { reply, replyMs } = await container.answerInquiry(body.data);
    return Response.json({ reply, provider: container.providerName, replyMs }, { headers: noStore });
  } catch (error) {
    if (isAiError(error)) return unavailableResponse(error);
    throw error;
  }
}
