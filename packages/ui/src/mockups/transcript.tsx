"use client";

import { Avatar } from "../primitives/avatar";
import { cx } from "../primitives/class-names";
import { ChannelFrame } from "./channel-frame";
import { useScrollToLatest } from "./scroll-to-latest";

export type TranscriptLine = {
  id: string;
  speaker: string;
  /** Call time, for example "04:12". */
  time: string;
  text: string;
  /** Phrases to mark, such as the client's numbers and pain points. */
  highlights?: string[];
  isNew?: boolean;
};

export type TranscriptProps = {
  title: string;
  /** Elapsed call time, for example "12:48". */
  elapsed?: string;
  /** "live" shows the live marker; "ended" closes the transcript with "Call ended". */
  state?: "idle" | "live" | "ended";
  participants?: string[];
  lines: TranscriptLine[];
  /** Speech heard but not final yet, from speech recognition or a film beat. Drawn grey with a caret. */
  interim?: { speaker: string; text?: string } | null;
  className?: string;
};

function escapePattern(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({ text, highlights }: { text: string; highlights?: string[] }) {
  if (!highlights?.length) return <>{text}</>;
  const pattern = new RegExp(`(${highlights.map(escapePattern).join("|")})`, "g");
  return (
    <>
      {text.split(pattern).map((part, index) =>
        highlights.includes(part) ? (
          <mark key={index} className="rounded bg-brand-soft px-0.5 font-medium text-foreground shadow-[inset_0_-2px_0_var(--brand-line)]">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function SpeakingBars() {
  return (
    <span aria-hidden="true" className="inline-flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2, 3].map((bar) => (
        <span key={bar} className="speaking-bar h-full w-[3px] rounded-full bg-channel-call" style={{ animationDelay: `${bar * 140}ms` }} />
      ))}
    </span>
  );
}

export function Transcript({ title, elapsed, state = "idle", participants = [], lines, interim, className }: TranscriptProps) {
  const list = useScrollToLatest<HTMLOListElement>(`${lines.length}-${interim?.text ?? ""}-${state}`);
  const meta =
    state === "ended" ? (
      <span className="tabular">Call ended{elapsed && `, ${elapsed}`}</span>
    ) : state === "live" ? (
    <span className="flex items-center gap-1.5 font-medium text-channel-call">
      <span className="size-2 rounded-full bg-channel-call" /> Live {elapsed && <span className="tabular text-muted">{elapsed}</span>}
    </span>
  ) : (
    elapsed && <span className="tabular">{elapsed}</span>
  );

  return (
    <ChannelFrame channel="Call transcript" icon="mic" accent="var(--channel-call)" meta={meta} className={className}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</h3>
        <span className="flex -space-x-2">
          {participants.map((name) => (
            <Avatar key={name} name={name} size={28} className="ring-2 ring-surface" />
          ))}
        </span>
      </header>
      <ol ref={list} aria-live="polite" className="scroll-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {lines.map((line) => (
          <li key={line.id} className={cx("flex gap-3", line.isNew && "enter")}>
            <Avatar name={line.speaker} size={32} />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold">{line.speaker}</span>
                <span className="tabular text-meta text-faint">{line.time}</span>
              </p>
              <p className="text-body text-foreground">
                <Highlighted text={line.text} highlights={line.highlights} />
              </p>
            </div>
          </li>
        ))}
        {interim && state !== "ended" && (
          <li className="enter flex gap-3" aria-label={`${interim.speaker} is speaking`}>
            <Avatar name={interim.speaker} size={32} className="ring-2 ring-channel-call ring-offset-2 ring-offset-surface" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="text-[15px] font-semibold">{interim.speaker}</span>
                <SpeakingBars />
              </p>
              <p className="caret text-body text-faint">{interim.text}</p>
            </div>
          </li>
        )}
        {state === "ended" && (
          <li className="enter flex items-center gap-3 pt-2 text-meta font-medium text-muted">
            <span className="h-px flex-1 bg-border" />
            Call ended{elapsed && ` at ${elapsed}`}
            <span className="h-px flex-1 bg-border" />
          </li>
        )}
      </ol>
    </ChannelFrame>
  );
}
