import { activeProviderName } from "@diepen/ai/provider-factory";

export function GET() {
  return Response.json({ ok: true, app: "meetings", provider: activeProviderName() });
}
