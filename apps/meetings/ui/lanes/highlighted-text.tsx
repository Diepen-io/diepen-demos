function escapePattern(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Text with phrases marked, for the prospect's numbers and pain points in the transcript. */
export function HighlightedText({ text, highlights }: { text: string; highlights: readonly string[] }) {
  const phrases = highlights.filter(Boolean);
  if (phrases.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${phrases.map(escapePattern).join("|")})`, "g"));
  return (
    <>
      {parts.map((part, index) =>
        phrases.includes(part) ? (
          <mark key={index} className="rounded-[4px] bg-brand-soft px-0.5 text-foreground shadow-[inset_0_-2px_0_var(--brand-line)]">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
