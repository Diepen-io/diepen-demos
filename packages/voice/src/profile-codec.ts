import { companyProfileSchema, type CompanyProfile } from "./profile.ts";

/**
 * Turns a profile into the `?brand=` URL parameter and back (decision S3). Browser-safe: it imports
 * only the profile schema. JSON goes through UTF-8 bytes first because `btoa` takes Latin-1 only.
 */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function encodeProfile(profile: CompanyProfile): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(profile)));
}

/** The profile in the value, or `null` when the value is not a valid encoded profile. */
export function decodeProfile(value: string | null | undefined): CompanyProfile | null {
  if (!value) return null;
  try {
    const json: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(value)));
    const result = companyProfileSchema.safeParse(json);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
