import type { LiveStatus } from "./use-live-call";

/** The element the guide points at. */
export type MeetingsSpotlight = "submit" | "try-again" | "draft-again" | "send";

/** What the guide button does. `end` offers "Start over" and the film. */
export type MeetingsGuideAction = "load-sample" | "end";

export type MeetingsGuide = {
  id: string;
  /** The place in the path, from 1. None at the end. */
  number?: number;
  text: string;
  waiting?: boolean;
  spotlight?: MeetingsSpotlight;
  action?: MeetingsGuideAction;
};

export const meetingsGuideSteps = 3;

export type MeetingsGuideInput = {
  status: LiveStatus;
  /** The transcript box holds a call the AI can read. */
  ready: boolean;
  /** The transcript changed after the AI drafted the outputs. */
  stale: boolean;
};

/**
 * The one next step in live mode: load a call, let the AI read it, send the email. Worked out from
 * the call's state, so a visitor who records or pastes a call lands on the same steps.
 */
export function meetingsGuide({ status, ready, stale }: MeetingsGuideInput): MeetingsGuide {
  if (status === "sent") {
    return { id: "end", text: "You sent the email with the proposal. The next meeting is in the calendar.", action: "end" };
  }
  if (status === "processing") return { id: "reading", number: 2, text: "The AI reads the call", waiting: true };
  if (status === "revealing") {
    return { id: "drafting", number: 3, text: "The AI writes the notes, the deal, the proposal and the email", waiting: true };
  }
  if (status === "failed") return { id: "failed", number: 2, text: "The draft failed. Tap Try again.", spotlight: "try-again" };
  if (stale) return { id: "stale", number: 2, text: "You changed the call. Tap Draft again.", spotlight: "draft-again" };
  if (status === "revealed") return { id: "send", number: 3, text: "Read the proposal and the email. Then tap Send.", spotlight: "send" };
  if (ready) return { id: "submit", number: 2, text: "Now let the AI read the call. Tap Turn this call into a proposal.", spotlight: "submit" };
  return { id: "load", number: 1, text: "You play the seller after a sales call. Start with our sample call.", action: "load-sample" };
}
