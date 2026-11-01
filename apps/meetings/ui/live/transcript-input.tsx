"use client";

import { Button } from "@diepen/ui/primitives/button";
import { Textarea } from "@diepen/ui/primitives/textarea";
import { cx } from "@diepen/ui/primitives/class-names";
import { checkTranscript, transcriptLimits } from "@/domain/transcript";
import { InputTabs, type InputTab } from "./input-tabs";
import { RecordPanel } from "./record-panel";
import type { Recording } from "./use-recording";

export type TranscriptInputProps = {
  tab: InputTab;
  onTab: (tab: InputTab) => void;
  transcript: string;
  onTranscript: (text: string) => void;
  recordSupported: boolean;
  recording: Recording;
  sellerShortName: string;
  sample: {
    /** Says who the sample call is between. */
    note: string;
    /** The box holds a transcript of the visitor's own, which loading the sample would replace. */
    replaces: boolean;
    onLoad: () => void;
  };
};

const count = new Intl.NumberFormat("en-US");

/** Record, paste or load a call. Every tab ends in the same editable transcript box. */
export function TranscriptInput({ tab, onTab, transcript, onTranscript, recordSupported, recording, sellerShortName, sample }: TranscriptInputProps) {
  const issue = transcript.trim() ? checkTranscript(transcript)[0] : undefined;

  return (
    <div className="flex flex-col gap-4">
      <InputTabs value={tab} onSelect={onTab} />
      <div id="input-panel" role="tabpanel" aria-labelledby={`input-tab-${tab}`}>
        {tab === "record" && <RecordPanel supported={recordSupported} recording={recording} sellerName={sellerShortName} />}
        {tab === "paste" && (
          <p className="text-[14px] leading-snug text-muted">
            One line per turn, for example <span className="font-medium text-foreground">[00:17] Tom Becker: We have 14 apartments.</span> Times are optional.
          </p>
        )}
        {tab === "sample" && (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] leading-snug text-muted">{sample.note}</p>
            {sample.replaces && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-subtle px-3.5 py-3">
                <p className="min-w-0 flex-1 text-[14px] leading-snug">Loading the sample replaces the transcript in the box.</p>
                <Button variant="secondary" size="sm" className="max-sm:h-11" onClick={sample.onLoad}>
                  Replace with the sample call
                </Button>
              </div>
            )}
          </div>
        )}
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
          className="min-h-[220px] font-mono text-[16px] leading-[1.6] sm:text-[13px] lg:min-h-[260px]"
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
