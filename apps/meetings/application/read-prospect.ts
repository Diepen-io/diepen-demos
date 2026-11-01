import type { SpeakerTurn } from "@/domain/transcript";

/** Facts the keyless mock reads from what the prospect said, with plain text rules. */

export type Figure = { label: string; value: string };

const maxFigures = 6;
const maxPainPoints = 3;
const maxLabelWords = 4;
const figurePattern = /\d+(?:,\d{3})*(?:\.\d+)?%?/g;
const painWords = /\b(?:worst|problem|late|drags|empty|hours|chasing|stress|too much|cost)/i;
/** "a month", "per week": a rate that belongs to the figure before it. */
const ratePattern = /^(?:a|an|per|each|every)\s+(hour|day|night|week|month|quarter|year)\b/i;
/** Words that end the phrase a figure counts: "14 apartments | and it just kept growing". */
const phraseEnd = new Set(
  "and or but so it it's i i'm we we're you he she they that which who because just is was are were be been has have had do did will would can could the my our your their this these those".split(
    " ",
  ),
);
/** A label that names money gets the profile's currency when the prospect said none. */
const moneyWords = /\b(?:rent|price|cost|costs|fee|fees|budget|revenue|salary|income)\b/i;
const currencyMark = /\b(?:EUR|USD|GBP|CHF|AUD|CAD|euros?|dollars?|pounds?)\b|[€$£]/i;
const timeUnits = new Set(["minutes", "hours", "days", "weeks", "months", "years"]);
/** A label never ends on one of these: "38 days on" reads as cut off. */
const danglingWords = new Set("a an across at by for from in into near of on per to with".split(" "));

function prospectTurns(turns: readonly SpeakerTurn[], prospect: string): { text: string; index: number }[] {
  return turns.flatMap((turn, index) => (turn.speaker === prospect ? [{ text: turn.text, index }] : []));
}

function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function capitalise(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** A four-digit number from 1900 to 2099 with no comma is a year, not a figure. */
function isYear(value: string): boolean {
  return /^(?:19|20)\d{2}$/.test(value);
}

/** The noun phrase right after a figure, inside its clause: "apartments across three buildings". */
function phraseAfter(clause: string): string {
  const phrase: string[] = [];
  for (const word of words(clause)) {
    const bare = word.toLowerCase().replace(/[^\p{L}'-]/gu, "");
    if (!bare || phraseEnd.has(bare) || phrase.length === maxLabelWords) break;
    phrase.push(bare);
    // "hours a month" is complete: what follows the rate is a new thought.
    if (ratePattern.test(phrase.slice(-2).join(" "))) break;
  }
  while (phrase.length > 0 && danglingWords.has(phrase.at(-1) ?? "")) phrase.pop();
  return phrase.join(" ");
}

/** "What's the average rent?" asked just before the answer gives the label "Average rent". */
function askedFor(turns: readonly SpeakerTurn[], index: number): string {
  const question = turns[index - 1]?.text ?? "";
  const match = /\bwhat(?:'s| is| are)\s+(?:the\s+|your\s+)?([\p{L}\s'-]{3,40}?)\s*\?/iu.exec(question);
  return match?.[1]?.trim().toLowerCase() ?? "";
}

/** "How long does the apartment stand empty?" before "38 days" gives "Days empty", not "Days on average". */
function howLongFor(turns: readonly SpeakerTurn[], index: number, phrase: string): string | null {
  const unit = phrase.split(" ")[0] ?? "";
  if (!timeUnits.has(unit)) return null;
  const question = turns[index - 1]?.text ?? "";
  const what = /\bhow long\b[^?]*?([\p{L}-]+)\s*\?/iu.exec(question)?.[1]?.toLowerCase();
  return what ? `${unit} ${what}` : null;
}

/**
 * Every figure the prospect gave, in order, with the words that say what it counts. Years, clock
 * times such as 10:00 and bare figures that nothing explains are skipped. A money figure said
 * without a currency gets `currency`, the one the profile quotes its prices in.
 */
export function prospectFigures(turns: readonly SpeakerTurn[], prospect: string, currency?: string | null): Figure[] {
  const figures: Figure[] = [];
  for (const { text, index } of prospectTurns(turns, prospect)) {
    for (const match of text.matchAll(figurePattern)) {
      const start = match.index;
      const end = start + match[0].length;
      if (text[start - 1] === ":" || text[end] === ":" || isYear(match[0])) continue;
      const clause = (text.slice(end).split(/[.,;:!?]/)[0] ?? "").trim();
      const rate = ratePattern.exec(clause)?.[1]?.toLowerCase();
      const phrase = phraseAfter(clause);
      const subject = rate ? askedFor(turns, index) : howLongFor(turns, index, phrase) ?? (phrase || askedFor(turns, index));
      if (!subject) continue;
      const label = capitalise(rate ? `${subject} a ${rate}` : subject);
      const unpricedMoney = currency && moneyWords.test(label) && !currencyMark.test(text.slice(Math.max(0, start - 12), end + 12));
      figures.push({ label, value: unpricedMoney ? `${currency} ${match[0]}` : match[0] });
      if (figures.length === maxFigures) return figures;
    }
  }
  return figures;
}

/** The prospect's sentences that name a pain, such as hours lost or chasing rent. */
export function prospectPainPoints(turns: readonly SpeakerTurn[], prospect: string): string[] {
  const sentences = prospectTurns(turns, prospect).flatMap(({ text }) => text.split(/(?<=[.!?])\s+/));
  return sentences.filter((sentence) => painWords.test(sentence)).slice(0, maxPainPoints);
}
