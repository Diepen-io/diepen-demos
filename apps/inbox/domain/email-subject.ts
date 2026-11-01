const maxSubjectChars = 60;

/** A subject for an email the customer sent without one: its first sentence, cut at a word near 60 characters. */
export function subjectFrom(text: string): string {
  const sentence = text.trim().split(/(?<=[.!?])\s/)[0]?.replace(/[.!]$/, "") ?? "";
  if (sentence.length <= maxSubjectChars) return sentence || "New message";
  const cut = sentence.slice(0, maxSubjectChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).replace(/[,;:]$/, "")}...`;
}
