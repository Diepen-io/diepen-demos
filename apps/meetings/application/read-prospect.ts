import type { SpeakerTurn } from "@/domain/transcript";

/** Facts the keyless mock reads from what the prospect said, with plain text rules. */

const maxFigures = 6;
const maxPainPoints = 3;
const figurePattern = /\d+(?:,\d{3})*(?:\.\d+)?/g;
const painWords = /\b(?:worst|problem|late|drags|empty|hours|chasing|stress|too much|cost)/i;

function prospectText(turns: readonly SpeakerTurn[], prospect: string): string[] {
  return turns.filter((turn) => turn.speaker === prospect).map((turn) => turn.text);
}

function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Up to four words after the figure inside its clause, else up to four before it. */
function labelFor(text: string, start: number, end: number): string {
  const after = words(text.slice(end).split(/[.,;:!?]/)[0] ?? "").slice(0, 4);
  const before = words(text.slice(0, start).split(/[.,;:!?]/).at(-1) ?? "").slice(-4);
  const label = (after.length > 0 ? after : before).join(" ").replace(/[^\p{L}\p{N}\s'-]/gu, "");
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "Figure";
}

/** Every figure the prospect gave, in order, skipping clock times such as 10:00. */
export function prospectFigures(turns: readonly SpeakerTurn[], prospect: string): { label: string; value: string }[] {
  const figures: { label: string; value: string }[] = [];
  for (const text of prospectText(turns, prospect)) {
    for (const match of text.matchAll(figurePattern)) {
      const start = match.index;
      const end = start + match[0].length;
      if (text[start - 1] === ":" || text[end] === ":") continue;
      figures.push({ label: labelFor(text, start, end), value: match[0] });
      if (figures.length === maxFigures) return figures;
    }
  }
  return figures;
}

/** The prospect's sentences that name a pain, such as hours lost or chasing rent. */
export function prospectPainPoints(turns: readonly SpeakerTurn[], prospect: string): string[] {
  const sentences = prospectText(turns, prospect).flatMap((text) => text.split(/(?<=[.!?])\s+/));
  return sentences.filter((sentence) => painWords.test(sentence)).slice(0, maxPainPoints);
}
