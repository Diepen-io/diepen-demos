import { cx } from "@diepen/ui/primitives/class-names";

/** The last word of the name stays whole, so "unsigned.pdf" never shows as "signed.pdf". */
function tailLength(text: string): number {
  const lastWord = text.length - Math.max(text.lastIndexOf("-"), text.lastIndexOf("_")) - 1;
  return lastWord > 0 && lastWord <= 18 && lastWord < text.length - 4 ? lastWord : Math.min(10, text.length);
}

/**
 * A long file name cut in the middle, so the year at the start and the extension at the end
 * stay readable on a phone. The full name stays in the title.
 */
export function MiddleTruncate({ text, className }: { text: string; className?: string }) {
  const tail = tailLength(text);
  const head = text.slice(0, text.length - tail);
  const end = text.slice(text.length - tail);
  return (
    <span title={text} className={cx("flex min-w-0 overflow-hidden", className)}>
      <span className="min-w-[4ch] truncate">{head}</span>
      {end && <span className="shrink-0">{end}</span>}
    </span>
  );
}
