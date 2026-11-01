import { cx } from "@diepen/ui/primitives/class-names";

/** Names this short show whole or cut at the end; a cut in the middle would only split a word. */
const splitAbove = 16;

/**
 * The part that always shows: the last word after "-", "_" or a space, so "unsigned.pdf" never shows
 * as "signed.pdf". A last word too long to keep whole leaves only the extension.
 */
export function keptTail(text: string): string {
  if (text.length <= splitAbove) return "";
  const lastWord = text.slice(Math.max(text.lastIndexOf("-"), text.lastIndexOf("_"), text.lastIndexOf(" ")) + 1);
  if (lastWord.length < text.length && lastWord.length <= 18) return lastWord;
  const dot = text.lastIndexOf(".");
  return dot > 0 ? text.slice(dot) : "";
}

/**
 * A long file name cut in the middle, so the year at the start and the extension at the end
 * stay readable on a phone. The full name stays in the title.
 */
export function MiddleTruncate({ text, className }: { text: string; className?: string }) {
  const end = keptTail(text);
  const head = text.slice(0, text.length - end.length);
  return (
    <span title={text} className={cx("flex min-w-0 overflow-hidden", className)}>
      <span className={cx("truncate", end && "min-w-[4ch]")}>{head}</span>
      {end && <span className="shrink-0">{end}</span>}
    </span>
  );
}
