import type { LaneId } from "./lanes";

/** The six things a call turns into, in the order the screen reveals them. */
export const outputSequence = ["summary", "numbers", "crm", "proposal", "email", "meeting"] as const;

export type OutputKind = (typeof outputSequence)[number];

const laneByOutput: Record<OutputKind, LaneId> = {
  summary: "ai",
  numbers: "ai",
  crm: "crm",
  proposal: "proposal",
  email: "proposal",
  meeting: "calendar",
};

/** The tool lane an output lands in. */
export function laneOf(kind: OutputKind): LaneId {
  return laneByOutput[kind];
}

/** Delay of each output after the answer arrives. With reduced motion everything shows at once. */
export function revealPlan(stepMs: number, reducedMotion: boolean): number[] {
  return outputSequence.map((_, index) => (reducedMotion ? 0 : index * stepMs));
}
