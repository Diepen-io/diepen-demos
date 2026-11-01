import { companyProfileSchema, type CompanyProfile } from "@diepen/voice/profile";

export const brandEndpoint = "/api/brand";

export type BrandResult =
  | { ok: true; profile: CompanyProfile; provider: string }
  | { ok: false; message: string };

/** Accepts what people type ("acme.de", "www.acme.de/about") and returns a full https URL, or null. */
export function normalizeWebsite(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
    return body.message;
  }
  return fallback;
}

/**
 * Asks the app's `/api/brand` route for a draft profile of a website. The route answers
 * `{ profile, provider }`, or a 4xx or 5xx with `{ message }`.
 */
export async function requestBrandProfile(url: string, signal?: AbortSignal): Promise<BrandResult> {
  let response: Response;
  try {
    response = await fetch(brandEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
      signal,
    });
  } catch {
    return { ok: false, message: "The demo server did not answer. Check your connection and try again." };
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: messageFrom(body, "That website could not be read. Try another page or fill in the form.") };
  }

  const shape = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const parsed = companyProfileSchema.safeParse(shape.profile);
  if (!parsed.success) {
    return { ok: false, message: "The draft came back incomplete. Fill in the form below instead." };
  }
  const provider = typeof shape.provider === "string" ? shape.provider : "unknown";
  return { ok: true, profile: parsed.data, provider };
}
