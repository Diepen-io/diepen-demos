"use client";

import { useSyncExternalStore } from "react";
import { createSpeechRecognizer, unsupportedRecognizer, type SpeechRecognizer } from "./speech-recognizer";

let browserRecognizer: SpeechRecognizer | null = null;

const noSubscription = () => () => {};

/** The browser's recognizer, created once. The server renders as if recording is not supported. */
export function useBrowserRecognizer(): SpeechRecognizer {
  return useSyncExternalStore(
    noSubscription,
    () => (browserRecognizer ??= createSpeechRecognizer(window)),
    () => unsupportedRecognizer,
  );
}
