"use client";

import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { Segmented } from "@diepen/ui/primitives/segmented";
import { useState } from "react";
import { formatCallTime } from "@/domain/transcript";
import { unnamedProspect } from "@/domain/call-sides";
import type { SpeechRecognizer } from "@/ui/speech/speech-recognizer";
import { useRecording, type RecordingStatus } from "./use-recording";

export type RecordPanelProps = {
  recognizer: SpeechRecognizer;
  /** The seller's first name, for the "Speaking now" toggle and the transcript lines. */
  sellerName: string;
  /** Receives each finished line, as "[00:03] Jonas: text". */
  onLine: (line: string) => void;
};

type Side = "seller" | "prospect";

const notes: Partial<Record<RecordingStatus, string>> = {
  denied: "The microphone is blocked. Allow it in the address bar, or paste a transcript.",
  failed: "Recording stopped. Paste a transcript or try again.",
  "time-up": "Recording stops at 10 minutes. Edit the transcript or turn it into a proposal.",
};

/** Records a role-played call with the browser's speech recognition, one speaker at a time. */
export function RecordPanel({ recognizer, sellerName, onLine }: RecordPanelProps) {
  const [side, setSide] = useState<Side>("seller");
  const speakerName = side === "seller" ? sellerName : unnamedProspect;
  const recording = useRecording(recognizer, speakerName, onLine);
  const { status } = recording;

  if (!recognizer.supported) {
    return (
      <p className="flex gap-2.5 rounded-xl bg-subtle px-3.5 py-3 text-[14px] leading-snug text-muted">
        <Icon name="info" size={17} className="mt-px shrink-0" />
        Recording needs Chrome, Edge or Safari. Paste a transcript or load the sample call.
      </p>
    );
  }

  const isRecording = status === "recording";
  const note = notes[status];
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[13px] font-medium text-muted">Speaking now</span>
        <Segmented
          label="Speaking now"
          value={side}
          onChange={setSide}
          options={[
            { value: "seller", label: sellerName },
            { value: "prospect", label: unnamedProspect },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        {isRecording ? (
          <Button variant="secondary" onClick={recording.stop}>
            <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-channel-call" />
            Stop
          </Button>
        ) : (
          <Button variant="secondary" onClick={recording.start}>
            <Icon name="mic" size={16} />
            {status === "denied" || status === "failed" ? "Try again" : "Start"}
          </Button>
        )}
        {isRecording && (
          <span className="flex items-center gap-2 text-[14px] font-medium text-channel-call" role="status">
            <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-channel-call" />
            Recording <span className="tabular text-muted">{formatCallTime(recording.elapsed)}</span>
          </span>
        )}
      </div>

      {isRecording && (recording.interim || recording.noSpeech) ? (
        <p className="rounded-xl bg-subtle px-3.5 py-2.5 text-[14px] leading-snug">
          {recording.interim ? (
            <>
              <span className="font-medium">{speakerName}: </span>
              <span className="caret text-faint">{recording.interim}</span>
            </>
          ) : (
            <span className="text-muted">No speech heard yet. Speak closer to the microphone.</span>
          )}
        </p>
      ) : null}

      {note ? <p className="text-[14px] leading-snug text-foreground">{note}</p> : null}
      <p className="text-[13px] leading-snug text-faint">Your browser&apos;s speech service turns your voice into text.</p>
    </div>
  );
}
