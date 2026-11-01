"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { ProviderNote } from "@diepen/ui/shell/provider-note";
import { useState } from "react";
import { firstName } from "@/domain/call-sides";
import { fillTokens, profileTokens } from "@/domain/profile-tokens";
import { checkTranscript, parseTranscript } from "@/domain/transcript";
import { useBrowserRecognizer } from "@/ui/speech/browser-recognizer";
import type { SpeechRecognizer } from "@/ui/speech/speech-recognizer";
import type { InputTab } from "./input-tabs";
import { LiveLanes } from "./live-lanes";
import { SendResult } from "./send-result";
import { TranscriptInput } from "./transcript-input";
import { useLiveCall } from "./use-live-call";
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
  const { profile, hrefWithBrand } = useBrand();
  const browserRecognizer = useBrowserRecognizer();
  const recognizer = injected ?? browserRecognizer;
  const [pickedTab, setPickedTab] = useState<InputTab | null>(null);
  const tab = pickedTab ?? (recognizer.supported ? "record" : "paste");
  const [transcript, setTranscript] = useState("");
  const call = useLiveCall(profile, hrefWithBrand("/"));
  useRevealScroll(call.revealed);

  const ownerFirst = firstName(profile.people.owner.name);
  const busy = call.status === "processing" || call.status === "revealing";
  const ready = checkTranscript(transcript).length === 0;

  function selectTab(next: InputTab) {
    setPickedTab(next);
    if (next === "sample") setTranscript(fillTokens(sampleCall, profileTokens(profile)));
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,32fr)_minmax(0,68fr)] lg:items-start lg:gap-6">
      <section aria-label="Your call" className="panel flex flex-col gap-4 p-4 sm:p-5 lg:sticky lg:top-5">
        <header className="flex flex-col gap-1">
          <h2 className="text-[19px] font-semibold tracking-[-0.015em]">Turn a sales call into a proposal</h2>
          <p className="text-[14px] leading-snug text-muted">
            Play both sides of a call as {ownerFirst} of {profile.name}, paste a real transcript, or load the sample call.
          </p>
          <ProviderNote providerName={providerName} className="mt-2 self-start" />
        </header>
        <TranscriptInput
          tab={tab}
          onTab={selectTab}
          transcript={transcript}
          onTranscript={setTranscript}
          recognizer={recognizer}
          sellerFirstName={ownerFirst}
          sampleNote={`A 32-minute discovery call between ${profile.people.owner.name} and Tom Becker, a fictional landlord with 14 apartments.`}
        />
        <Button variant="brand" size="lg" disabled={!ready || busy} onClick={() => call.submit(transcript)}>
          <Icon name="sparkle" size={18} />
          Turn this call into a proposal
        </Button>
        {call.outputs && (
          <Button variant="ghost" className="-mt-2 self-center" onClick={call.startOver}>
            Start over
          </Button>
        )}
        {call.status === "failed" && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-fail-soft px-3.5 py-3 text-[14px] text-fail">
            <p className="min-w-0 flex-1">The draft did not come through. Try again.</p>
            <Button variant="secondary" size="sm" onClick={() => call.submit(transcript)} disabled={!ready}>
              Try again
            </Button>
          </div>
        )}
      </section>

      <div className="flex min-w-0 flex-col gap-4">
        {call.sentAfterMs !== null && <SendResult afterMs={call.sentAfterMs} />}
        <LiveLanes call={call} profile={profile} turns={parseTranscript(transcript).length} />
      </div>
    </div>
  );
}
