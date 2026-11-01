"use client";

import { Textarea } from "@diepen/ui/primitives/textarea";
import { cx } from "@diepen/ui/primitives/class-names";
import { checkTranscript, transcriptLimits } from "@/domain/transcript";
import type { SpeechRecognizer } from "@/ui/speech/speech-recognizer";
import { InputTabs, type InputTab } from "./input-tabs";
import { RecordPanel } from "./record-panel";

export type TranscriptInputProps = {
  tab: InputTab;
  onTab: (tab: InputTab) => void;
  transcript: string;
  onTranscript: (text: string) => void;
  recognizer: SpeechRecognizer;
  sellerFirstName: string;
  /** Says who the sample call is between, for the "Sample call" tab. */
  sampleNote: string;
};

const count = new Intl.NumberFormat("en-US");

/** Record, paste or load a call. Every tab ends in the same editable transcript box. */
export function TranscriptInput({ tab, onTab, transcript, onTranscript, recognizer, sellerFirstName, sampleNote }: TranscriptInputProps) {
  const issue = transcript.trim() ? checkTranscript(transcript)[0] : undefined;
  const appendLine = (line: string) => onTranscript(transcript.trim() ? `${transcript.trimEnd()}\n${line}` : line);

  return (
    <div className="flex flex-col gap-4">
      <InputTabs value={tab} onSelect={onTab} />
      <div id="input-panel" role="tabpanel" aria-labelledby={`input-tab-${tab}`}>
        {tab === "record" && <RecordPanel recognizer={recognizer} sellerName={sellerFirstName} onLine={appendLine} />}
        {tab === "paste" && (
          <p className="text-[14px] leading-snug text-muted">
            One line per turn, for example <span className="font-medium text-foreground">[00:17] Tom Becker: We have 14 apartments.</span> Times are optional.
          </p>
        )}
        {tab === "sample" && <p className="text-[14px] leading-snug text-muted">{sampleNote}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="call-transcript" className="text-[14px] font-medium">
            Call transcript
          </label>
          <span className={cx("tabular text-[13px]", transcript.length > transcriptLimits.maxCharacters ? "text-fail" : "text-faint")}>
            {count.format(transcript.length)} / {count.format(transcriptLimits.maxCharacters)}
          </span>
        </div>
        <Textarea
          id="call-transcript"
          value={transcript}
          onChange={(event) => onTranscript(event.target.value)}
          rows={12}
          spellCheck={false}
          aria-invalid={issue ? true : undefined}
          aria-describedby={issue ? "transcript-issue" : undefined}
          placeholder={"[00:00] You: Thanks for making the time.\n[00:05] Prospect: Happy to. So, about our flats."}
          className="min-h-[220px] font-mono text-[13px] leading-[1.6] sm:text-[13px] lg:min-h-[260px]"
        />
        {issue && (
          <p id="transcript-issue" className="text-[13px] text-fail">
            {issue.message}
          </p>
        )}
      </div>
    </div>
  );
}
