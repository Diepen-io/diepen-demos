/**
 * Small text rules for names that land in the middle of a sentence, for example a document type
 * the model wrote as "Donation receipt".
 */

/** "Donation receipt" becomes "donation receipt"; "PDF scan" stays as it is. */
export function inSentence(text: string): string {
  const [first = "", second = ""] = text;
  return second === second.toUpperCase() && /[A-Z]/.test(second) ? text : first.toLowerCase() + text.slice(1);
}

/** "a donation receipt", "an annual payslip summary". */
export function withArticle(phrase: string): string {
  return `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;
}

/** "Not signed" from "not signed", for the first word of a line. */
export function capitalised(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
