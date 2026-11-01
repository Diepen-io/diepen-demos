import type { CompanyProfile } from "@diepen/voice/profile";
import type { Channel } from "@/domain/channel";

/**
 * Wording helpers for the keyless mock replies: how each channel frames a reply, and how a
 * customer's question is matched against the company knowledge, word by word.
 */

/** Email greets and signs off; LinkedIn ends with the assistant's name; Instagram and chat send the text alone. */
export function frameForChannel(body: string, channel: Channel, profile: CompanyProfile): string {
  if (channel === "email") {
    const signOff = profile.voice.signOff.trim() || profile.people.assistantName;
    return `Hi there,\n\n${body}\n\n${signOff}`;
  }
  if (channel === "linkedin") return `${body}\n\n${profile.people.assistantName}`;
  return body;
}

/** Ends a sentence with a full stop unless it already ends with punctuation. */
export const sentence = (text: string) => {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const commonWords = new Set([
  "about", "also", "been", "could", "does", "from", "have", "here", "just", "know", "like", "make", "many", "more", "much",
  "need", "please", "some", "tell", "than", "that", "their", "them", "there", "they", "this", "very", "want", "what", "when",
  "where", "which", "will", "with", "would", "your", "yours",
]);

/** The words that carry meaning: four letters or more and not a common word. */
export function keyWords(text: string): string[] {
  return (text.toLowerCase().match(/\p{L}[\p{L}'-]*/gu) ?? []).filter((word) => word.length >= 4 && !commonWords.has(word));
}

/** How many of the message's key words appear in `text`, so "Do you take new patients?" finds that FAQ. */
export function overlap(words: readonly string[], text: string): number {
  const target = new Set(keyWords(text));
  return words.filter((word) => target.has(word) || target.has(word.replace(/s$/, ""))).length;
}

const questionStart = /^(do|does|did|can|could|is|are|was|will|would|have|has|what|how|where|when|why|who|which)\b/;

export const isQuestion = (text: string) => text.includes("?") || questionStart.test(text.trim().toLowerCase());
