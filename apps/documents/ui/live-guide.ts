import { isComplete } from "@/domain/checklist";
import type { LiveState } from "./live-state";

/** The element on Daniel's phone the guide points at. */
export type DocumentsSpotlight = "request-email" | "upload-and-sign" | "use-a-sample" | "done-for-now";

/** What the guide button does. `end` offers "Start over" and the film. */
export type DocumentsGuideAction = "show-upload" | "skip" | "end";

export type DocumentsGuide = {
  id: string;
  /** The place in the path, from 1. None at the end. */
  number?: number;
  text: string;
  waiting?: boolean;
  spotlight?: DocumentsSpotlight;
  action?: DocumentsGuideAction;
};

export const documentsGuideSteps = 6;

/**
 * The one next step in live mode, worked out from the live state alone, so any path the visitor
 * takes still lands on a step: open the email, send a file, press "Done for now", skip twice.
 */
export function documentsGuide(state: LiveState): DocumentsGuide {
  const { session } = state;
  const chases = session.chases.length;
  if (session.escalated) {
    return { id: "end-escalated", text: "Daniel did not answer 2 reminders. So the chaser gave the firm a task: call Daniel.", action: "end" };
  }
  if (isComplete(state.items) && (session.submittedAt || chases > 0)) {
    return { id: "end-complete", text: "All 6 files are in and correct. The firm can start the tax return.", action: "end" };
  }
  if (state.checks.some((check) => check.phase === "reading")) {
    return { id: "reading", number: 3, text: "The chaser reads and checks your file", waiting: true };
  }
  if (chases === 1) {
    return { id: "skip-1", number: 5, text: "The chaser emailed Daniel a list of the missing files. What if he does nothing?", action: "skip" };
  }
  if (chases >= 2) {
    return { id: "skip-2", number: 6, text: "Daniel got a reminder. He still does nothing. Skip 3 more days.", action: "skip" };
  }
  if (state.screen === "letter" && !state.signature) {
    return { id: "sign", number: 3, text: "Draw or type your name. Then tap Sign." };
  }
  const sentSomething = state.checks.length > 0 || Boolean(state.signature);
  if (sentSomething) {
    return state.screen === "upload"
      ? { id: "done", number: 4, text: "The chaser checked it. Now tap Done for now.", spotlight: "done-for-now" }
      : { id: "done-elsewhere", number: 4, text: "Open the upload page again. Then tap Done for now.", action: "show-upload" };
  }
  if (state.screen === "email") {
    return { id: "open-upload", number: 2, text: "The firm needs 6 files from Daniel. Tap Upload and sign.", spotlight: "upload-and-sign" };
  }
  if (state.screen === "upload") {
    return { id: "send-file", number: 3, text: "Send one file. Tap Use a sample and pick a file.", spotlight: "use-a-sample" };
  }
  return { id: "open-email", number: 1, text: "You play Daniel, a client. Open the new email on his phone.", spotlight: "request-email" };
}
