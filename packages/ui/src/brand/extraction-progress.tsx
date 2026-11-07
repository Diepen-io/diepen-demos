"use client";

import { useEffect, useState } from "react";

/** What the server is doing, in the order it does it. Times match a typical page fetch and draft. */
const steps = [
  { afterSeconds: 0, text: (host: string) => `Opening ${host}` },
  { afterSeconds: 3, text: () => "Reading the page and drafting your profile" },
  { afterSeconds: 20, text: () => "Still drafting. Large sites take up to a minute." },
];

export function ExtractionProgress({ host }: { host: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 500);
    return () => clearInterval(timer);
  }, []);

  const step = steps.findLast((candidate) => seconds >= candidate.afterSeconds) ?? steps[0];
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl bg-subtle px-4 py-3">
      <span aria-hidden="true" className="flex gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="typing-dot size-1.5 rounded-full bg-foreground"
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </span>
      <span className="min-w-0 flex-1 text-body text-foreground">{step?.text(host)}</span>
      <span className="tabular text-meta text-faint">{seconds} s</span>
    </div>
  );
}
