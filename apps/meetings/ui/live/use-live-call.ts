"use client";

import { usePrefersReducedMotion } from "@diepen/ui/film/use-stage-environment";
import { useFilmFallback } from "@diepen/ui/shell/film-fallback";
import { useEffect, useRef, useState } from "react";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { MeetingOutputs } from "@/domain/meeting-outputs";
import { outputSequence, revealPlan } from "@/domain/output-sequence";
import { markProposalSent } from "@/domain/proposal-sent";
import { parseTranscript } from "@/domain/transcript";
import { requestOutputs } from "./outputs-client";

export type LiveStatus = "ready" | "processing" | "revealing" | "revealed" | "sent" | "failed";

/** Outputs appear one after the other, this far apart. */
const revealStepMs = 700;

export type LiveCall = {
  status: LiveStatus;
  outputs: MeetingOutputs | null;
  /** The transcript the AI read, trimmed, so the page can tell when the box no longer matches it. */
  submitted: string | null;
  /** Turns in the submitted transcript. */
  submittedTurns: number;
  /** How many outputs show, in sequence order. */
  revealed: number;
  /** Seconds since the visitor pressed the button, while the AI works. */
  waitedSeconds: number;
  /** Milliseconds from the press to the send. */
  sentAfterMs: number | null;
  sentAt: Date | null;
  submit: (transcript: string) => void;
  send: () => void;
  startOver: () => void;
};

/**
 * The live call from button press to sent email. A tripped cost guard sends the visitor to the
 * film with the fallback note; a failed model call leaves them here to try again.
 */
export function useLiveCall(profile: CompanyProfile): LiveCall {
  const toFilm = useFilmFallback();
  const reducedMotion = usePrefersReducedMotion();
  const [status, setStatus] = useState<LiveStatus>("ready");
  const [outputs, setOutputs] = useState<MeetingOutputs | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [waitedSeconds, setWaitedSeconds] = useState(0);
  const [sent, setSent] = useState<{ at: Date; afterMs: number } | null>(null);
  const pressedAt = useRef(0);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (status !== "processing") return;
    const timer = window.setInterval(() => setWaitedSeconds(Math.floor((Date.now() - pressedAt.current) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "revealing") return;
    const timers = revealPlan(revealStepMs, reducedMotion).map((delay, index) =>
      window.setTimeout(() => {
        setRevealed(index + 1);
        if (index === outputSequence.length - 1) setStatus("revealed");
      }, delay),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [status, reducedMotion]);

  async function run(transcript: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const result = await requestOutputs({ transcript, profile }, controller.signal).catch(() => null);
    if (!result || controller.signal.aborted) return;
    if (result.kind === "fallback") {
      toFilm();
      return;
    }
    if (result.kind === "failed") {
      setStatus("failed");
      return;
    }
    setOutputs(result.outputs);
    setRevealed(0);
    setStatus("revealing");
  }

  return {
    status,
    outputs,
    submitted,
    submittedTurns: submitted ? parseTranscript(submitted).length : 0,
    revealed,
    waitedSeconds,
    sentAfterMs: sent?.afterMs ?? null,
    sentAt: sent?.at ?? null,
    submit(transcript) {
      pressedAt.current = Date.now();
      setSubmitted(transcript.trim());
      setWaitedSeconds(0);
      setOutputs(null);
      setSent(null);
      setStatus("processing");
      void run(transcript);
    },
    send() {
      if (!outputs) return;
      const now = new Date();
      setSent({ at: now, afterMs: now.getTime() - pressedAt.current });
      setOutputs(markProposalSent(outputs));
      setStatus("sent");
    },
    startOver() {
      request.current?.abort();
      setOutputs(null);
      setSubmitted(null);
      setRevealed(0);
      setSent(null);
      setStatus("ready");
    },
  };
}
