/**
 * Names as people say them. `@diepen/voice/person-name` will hold `firstName` with the same rule;
 * until then this app keeps its own.
 */

/** Titles that come before a name. A greeting skips them: "Dr. Lena Okafor" is "Lena". */
const titles = new Set(["dr", "mr", "mrs", "ms", "miss", "mx", "prof", "sir", "dame"]);

/** What the CRM calls a prospect whose name the call never says. */
export const unnamedContact = "New contact";

/** Labels for a role or a group, not a person: "the team", "Prospect", "Speaker", "New contact". */
const notAPerson = /^(?:the\s|prospect$|speaker$|you$|unknown\b|new contact$|client$|customer$)/i;

export function firstName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const named = words.find((word) => !titles.has(word.toLowerCase().replace(/\.$/, "")));
  return named ?? words[0] ?? fullName.trim();
}

/** False for a label such as "the team" or "Prospect", so a sentence never greets it by name. */
export function isPersonName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed !== "" && !notAPerson.test(trimmed);
}

/** A transcript speaker label holds no colon, starts with a letter and has at most 40 characters. */
export function speakerLabel(name: string, fallback: string): string {
  const clean = name.replace(/:/g, " ").replace(/\s+/g, " ").trim();
  const cut = clean.length <= 40 ? clean : clean.slice(0, 41).replace(/\s+\S*$/, "").replace(/(?:\s+(?:and|of|for|the|&))+$/i, "");
  return /^\p{L}/u.test(cut) && cut.length <= 40 ? cut : fallback;
}
