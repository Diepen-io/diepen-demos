"use client";

import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { Segmented } from "@diepen/ui/primitives/segmented";
import { formatCallTime } from "@/domain/transcript";
import { unnamedProspect } from "@/domain/call-sides";
import type { Recording, RecordingStatus } from "./use-recording";

export type RecordPanelProps = {
  /** False when the browser has no speech recognition. */
  supported: boolean;
  /** The page holds the recording, so pressing "Turn this call into a proposal" can stop it. */
  recording: Recording;
  /** The seller's short name, for the "Speaking now" toggle. */
  sellerName: string;
};

const notes: Partial<Record<RecordingStatus, string>> = {
  denied: "The microphone is blocked. Allow it in the address bar, or paste a transcript.",
  failed: "Recording stopped. Paste a transcript or try again.",
  "time-up": "Recording stops at 10 minutes. Edit the transcript or turn it into a proposal.",
};

/** Records a role-played call with the browser's speech recognition, one speaker at a time. */
export function RecordPanel({ supported, recording, sellerName }: RecordPanelProps) {
  const { status, speakerName } = recording;

  if (!supported) {
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
          className="max-sm:*:h-11"
          label="Speaking now"
          value={recording.side}
          onChange={recording.setSide}
          options={[
            { value: "seller", label: sellerName },
            { value: "prospect", label: unnamedProspect },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        {isRecording ? (
          <Button variant="secondary" className="max-sm:h-11" onClick={recording.stop}>
            <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-channel-call" />
            Stop
          </Button>
        ) : (
          <Button variant="secondary" className="max-sm:h-11" onClick={recording.start}>
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
