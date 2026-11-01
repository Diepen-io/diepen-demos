import type { CheckResult } from "./check-result";
import type { RequestItem } from "./document-request";

/**
 * One name pattern for every filed document, so a folder sorts by year and person:
 * `{year}_{Lastname}-{Firstname}_{File label}[_{first issue}].{ext}`, ASCII only.
 */

export type FileExtension = "pdf" | "png" | "jpg";

const maxStemLength = 80;

/** Letters that do not decompose into a base letter and an accent. */
const ligatures: Record<string, string> = { ß: "ss", æ: "ae", Æ: "AE", ø: "o", Ø: "O", œ: "oe", Œ: "OE", đ: "d", Đ: "D", ł: "l", Ł: "L", þ: "th", Þ: "Th" };

function ascii(text: string): string {
  return text
    .replace(/[ßæÆøØœŒđĐłŁþÞ]/g, (letter) => ligatures[letter] ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "");
}

/** Words become hyphenated ASCII; everything but letters, digits and hyphens is dropped. */
function namePart(text: string): string {
  return ascii(text)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/** "Daniel Okafor" becomes "Okafor-Daniel": the last word is the family name. */
function personPart(person: string | null): string {
  const words = person?.trim().split(/\s+/).filter(Boolean) ?? [];
  const last = words.at(-1);
  if (!last) return "Unknown";
  const name = [namePart(last), namePart(words.slice(0, -1).join(" "))].filter(Boolean).join("-");
  return name || "Unknown";
}

export function fileNameFor(item: RequestItem, result: CheckResult, extension: FileExtension): string {
  const year = result.year === null ? "no-year" : String(result.year);
  const issue = result.issues[0]?.kind.replaceAll("_", "-");
  const suffix = `_${item.fileLabel}${issue ? `_${issue}` : ""}`;
  const room = maxStemLength - year.length - 1 - suffix.length;
  const person = personPart(result.person).slice(0, Math.max(room, 1)).replace(/-$/, "");
  return `${year}_${person}${suffix}.${extension}`;
}

export function extensionFor(mediaType: "application/pdf" | "image/png" | "image/jpeg"): FileExtension {
  if (mediaType === "image/png") return "png";
  if (mediaType === "image/jpeg") return "jpg";
  return "pdf";
}
