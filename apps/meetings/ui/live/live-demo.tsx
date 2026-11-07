"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { spotlight } from "@diepen/ui/guide/spotlight";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { ProviderNote } from "@diepen/ui/shell/provider-note";
import { useCallback, useState } from "react";
import { fillTokens, profileTokens } from "@/domain/profile-tokens";
import { sellerOf } from "@/domain/seller";
import { checkTranscript, parseTranscript } from "@/domain/transcript";
import { useBrowserRecognizer } from "@/ui/speech/browser-recognizer";
import type { SpeechRecognizer } from "@/ui/speech/speech-recognizer";
import type { InputTab } from "./input-tabs";
import { meetingsGuide } from "./live-guide";
import { LiveLanes } from "./live-lanes";
import { MeetingsGuideBar } from "./meetings-guide-bar";
import { StaleNote } from "./stale-note";
import { TranscriptInput } from "./transcript-input";
import { useLiveCall } from "./use-live-call";
import { useRecording } from "./use-recording";
import { useRevealScroll } from "./use-reveal-scroll";

export type LiveDemoProps = {
  providerName: "claude" | "mock";
  /** The sample call with its tokens unfilled. */
  sampleCall: string;
  /** Tests pass a fake; the page uses the browser's speech recognition. */
  recognizer?: SpeechRecognizer;
};

/** Live mode: a call goes in, the six outputs come out in the active company's voice and prices. */
export function LiveDemo({ providerName, sampleCall, recognizer: injected }: LiveDemoProps) {
  const { profile } = useBrand();
  const browserRecognizer = useBrowserRecognizer();
  const recognizer = injected ?? browserRecognizer;
  const seller = sellerOf(profile);
  const [pickedTab, setPickedTab] = useState<InputTab | null>(null);
  const tab = pickedTab ?? (recognizer.supported ? "record" : "paste");
  const [transcript, setTranscript] = useState("");
  const appendLine = useCallback((line: string) => setTranscript((text) => (text.trim() ? `${text.trimEnd()}\n${line}` : line)), []);
  const recording = useRecording(recognizer, seller.short, appendLine);
  const call = useLiveCall(profile);
  useRevealScroll(call.revealed);

  const filledSample = fillTokens(sampleCall, profileTokens(profile));
  const ownTranscript = transcript.trim() !== "" && transcript !== filledSample;
  const busy = call.status === "processing" || call.status === "revealing";
  const ready = checkTranscript(transcript).length === 0;
  const stale = call.outputs !== null && !busy && call.submitted !== transcript.trim();
  const guide = meetingsGuide({ status: call.status, ready, stale });

  function selectTab(next: InputTab) {
    if (next !== "record") recording.stop();
    setPickedTab(next);
    if (next === "sample" && !ownTranscript) setTranscript(filledSample);
  }

  function submit() {
    recording.stop();
    call.submit(transcript);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 md:px-8 lg:grid lg:grid-cols-[minmax(0,32fr)_minmax(0,68fr)] lg:items-start lg:gap-6">
      <MeetingsGuideBar guide={guide} onLoadSample={() => selectTab("sample")} onStartOver={call.startOver} className="lg:col-span-2" />
      <section aria-label="Your call" className="panel flex flex-col gap-4 p-4 sm:p-5 lg:sticky lg:top-28">
        <header className="flex flex-col gap-1">
          <h2 className="text-title font-semibold tracking-[-0.015em]">Turn a sales call into a proposal</h2>
          <p className="text-body leading-snug text-muted">
            You play {seller.person ? `${seller.short} of ${seller.company}` : seller.company}. Record a call, paste one, or load our sample
            call.
          </p>
          <ProviderNote providerName={providerName} className="mt-2 self-start" />
        </header>
        <TranscriptInput
          tab={tab}
          onTab={selectTab}
          transcript={transcript}
          onTranscript={setTranscript}
          recordSupported={recognizer.supported}
          recording={recording}
          sellerShortName={seller.short}
          sample={{
            note: `A 32-minute sales call between ${seller.person ?? seller.company} and Tom Becker, a fictional landlord with 14 apartments.`,
            replaces: ownTranscript,
            onLoad: () => setTranscript(filledSample),
          }}
        />
        <Button variant="brand" size="lg" disabled={!ready || busy} onClick={submit} {...spotlight(guide.spotlight === "submit")}>
          <Icon name="sparkle" size={18} />
          Turn this call into a proposal
        </Button>
        {/* Once the email is sent, the guide offers "Start over" itself. */}
        {call.outputs && call.status !== "sent" && (
          <Button variant="ghost" className="-mt-2 self-center max-sm:h-11" onClick={call.startOver}>
            Start over
          </Button>
        )}
        {call.status === "failed" && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-fail-soft px-3.5 py-3 text-body text-fail">
            <p className="min-w-0 flex-1">The draft failed. Try again.</p>
            <Button variant="secondary" size="sm" onClick={submit} disabled={!ready} {...spotlight(guide.spotlight === "try-again")}>
              Try again
            </Button>
          </div>
        )}
      </section>

      <div className="flex min-w-0 flex-col gap-4">
        {stale && <StaleNote onUpdate={submit} disabled={!ready} spotlight={guide.spotlight === "draft-again"} />}
        <LiveLanes
          call={call}
          profile={profile}
          stale={stale}
          waitingFor={ready ? `Ready to read ${parseTranscript(transcript).length} turns` : "Waiting for a call"}
          spotlightSend={guide.spotlight === "send"}
        />
      </div>
    </div>
  );
}
