"use client";

import { useEffect, useRef, useState } from "react";
import { transcriptLimits, formatCallTime } from "@/domain/transcript";
import type { SpeechErrorKind, SpeechRecognizer } from "@/ui/speech/speech-recognizer";

export type RecordingStatus = "idle" | "recording" | "denied" | "failed" | "time-up";

export type Recording = {
  status: RecordingStatus;
  /** Seconds since Start. */
  elapsed: number;
  interim: string;
  noSpeech: boolean;
  start: () => void;
  stop: () => void;
};

/**
 * Drives one recognizer: each final result becomes a timed line for the speaker of the moment.
 * Chrome ends a session after a pause, so the recording restarts until the visitor stops it.
 */
export function useRecording(recognizer: SpeechRecognizer, speakerName: string, onLine: (line: string) => void): Recording {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [interim, setInterim] = useState("");
  const [noSpeech, setNoSpeech] = useState(false);
  const startedAt = useRef(0);
  const wanted = useRef(false);
  const latest = useRef({ speakerName, onLine });
  useEffect(() => {
    latest.current = { speakerName, onLine };
  });

  useEffect(() => {
    if (status !== "recording") return;
    const tick = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    const limit = window.setTimeout(() => {
      wanted.current = false;
      setStatus("time-up");
      recognizer.stop();
    }, transcriptLimits.maxRecordingMs);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(limit);
    };
  }, [status, recognizer]);

  // Unmounting the panel ends the recording.
  useEffect(
    () => () => {
      if (!wanted.current) return;
      wanted.current = false;
      recognizer.stop();
    },
    [recognizer],
  );

  function listen() {
    recognizer.start({
      onInterim: (text) => {
        setInterim(text);
        setNoSpeech(false);
      },
      onFinal: (text) => {
        setInterim("");
        if (!text) return;
        const seconds = (Date.now() - startedAt.current) / 1000;
        latest.current.onLine(`[${formatCallTime(seconds)}] ${latest.current.speakerName}: ${text}`);
      },
      onError: (kind: SpeechErrorKind) => {
        if (kind === "no-speech") {
          setNoSpeech(true);
          return;
        }
        wanted.current = false;
        setStatus(kind === "denied" ? "denied" : "failed");
      },
      onEnd: () => {
        if (wanted.current) listen();
        else setStatus((current) => (current === "recording" ? "idle" : current));
        setInterim("");
      },
    });
  }

  return {
    status,
    elapsed,
    interim,
    noSpeech,
    start() {
      startedAt.current = Date.now();
      wanted.current = true;
      setElapsed(0);
      setNoSpeech(false);
      setStatus("recording");
      listen();
    },
    stop() {
      wanted.current = false;
      recognizer.stop();
    },
  };
}
