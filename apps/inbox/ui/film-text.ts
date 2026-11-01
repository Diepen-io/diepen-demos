import type { CompanyProfile } from "@diepen/voice/profile";

const greeting = /^(hi|hello|dear)\b[^\n.!?]*,$/i;
const closing = /^(thanks|thank you|warm regards|best regards|kind regards|cheers)\b[^\n]*,(\n[^\n]+)?$/i;

/**
 * A filled message as the film shows it: the greeting and sign-off paragraphs of an email go,
 * because the film keeps only what the beat is about. Live mode shows every word.
 */
export function filmText(text: string, profile: CompanyProfile): string {
  const skip = new Set([profile.voice.signOff.trim(), profile.people.assistantName]);
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !greeting.test(paragraph) && !closing.test(paragraph) && !skip.has(paragraph))
    .join("\n\n");
}
