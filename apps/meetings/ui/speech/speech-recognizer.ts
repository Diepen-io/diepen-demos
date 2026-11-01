/**
 * The browser's speech recognition behind one small interface, so the rest of the UI never
 * touches the Web Speech API and tests can pass a fake.
 */
export type SpeechErrorKind = "denied" | "no-speech" | "other";

export type SpeechHandlers = {
  onInterim(text: string): void;
  onFinal(text: string): void;
  onError(kind: SpeechErrorKind): void;
  onEnd(): void;
};

export type SpeechRecognizer = {
  readonly supported: boolean;
  start(handlers: SpeechHandlers): void;
  stop(): void;
};

type RecognitionResult = { readonly isFinal: boolean; readonly length: number; [index: number]: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: { readonly length: number; [index: number]: RecognitionResult } };

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

type RecognitionConstructor = new () => Recognition;

export const unsupportedRecognizer: SpeechRecognizer = { supported: false, start: () => {}, stop: () => {} };

function errorKind(code: string): SpeechErrorKind {
  if (code === "not-allowed" || code === "service-not-allowed") return "denied";
  return code === "no-speech" ? "no-speech" : "other";
}

export function createSpeechRecognizer(scope: Window): SpeechRecognizer {
  const constructors = scope as unknown as Record<string, RecognitionConstructor | undefined>;
  const Constructor = constructors.SpeechRecognition ?? constructors.webkitSpeechRecognition;
  if (typeof Constructor !== "function") return unsupportedRecognizer;
  let active: Recognition | null = null;

  return {
    supported: true,
    start(handlers) {
      const recognition = new Constructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = scope.navigator.language;
      recognition.onresult = (event) => {
        let interim = "";
        for (let index = event.resultIndex; index < event.results.length; index++) {
          const result = event.results[index];
          const text = result?.[0]?.transcript ?? "";
          if (result?.isFinal) handlers.onFinal(text.trim());
          else interim += text;
        }
        if (interim) handlers.onInterim(interim.trim());
      };
      recognition.onerror = (event) => handlers.onError(errorKind(event.error));
      recognition.onend = () => {
        if (active === recognition) active = null;
        handlers.onEnd();
      };
      active = recognition;
      recognition.start();
    },
    stop() {
      active?.stop();
    },
  };
}
