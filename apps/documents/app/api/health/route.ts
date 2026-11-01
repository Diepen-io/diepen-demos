import { container } from "@/infrastructure/container";

export function GET() {
  try {
    return Response.json({ ok: true, app: "documents", provider: container.providerName, ocr: container.ocrName() });
  } catch (error) {
    // A misconfigured OCR adapter must show here, before the first upload fails.
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ ok: false, app: "documents", error: message }, { status: 500 });
  }
}
