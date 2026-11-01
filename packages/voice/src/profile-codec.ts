import { presets } from "./presets.ts";
import { companyProfileSchema, type CompanyProfile } from "./profile.ts";

/**
 * Turns a profile into the `?brand=` URL parameter and back (decision S3). A preset travels as its
 * short id, for example `ottervale-dental`, so a shared link stays readable. Any other profile
 * travels as base64url JSON. Browser-safe: it imports only the profile schema and the presets.
 * JSON goes through UTF-8 bytes first because `btoa` takes Latin-1 only.
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

/** JSON with sorted keys and no undefined values, so two equal profiles give the same text. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );
}

const presetIdByJson = new Map(Object.entries(presets).map(([id, preset]) => [canonicalJson(preset), id]));

function presetById(value: string): CompanyProfile | null {
  return Object.hasOwn(presets, value) ? presets[value as keyof typeof presets] : null;
}

/** A preset, unchanged, gives its id. An edited preset or any other profile gives base64url JSON. */
export function encodeProfile(profile: CompanyProfile): string {
  return presetIdByJson.get(canonicalJson(profile)) ?? toBase64Url(new TextEncoder().encode(JSON.stringify(profile)));
}

/** The profile in the value, or `null` when the value is neither a preset id nor a valid encoded profile. */
export function decodeProfile(value: string | null | undefined): CompanyProfile | null {
  if (!value) return null;
  const preset = presetById(value);
  if (preset) return preset;
  try {
    const json: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(value)));
    const result = companyProfileSchema.safeParse(json);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
