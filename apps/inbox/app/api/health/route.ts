import { activeProviderName } from "@diepen/ai/provider-factory";

/** Tells the UI and the e2e runner which provider answers, without a model call. */
export function GET(): Response {
  return Response.json({ ok: true, app: "inbox", provider: activeProviderName() });
}
