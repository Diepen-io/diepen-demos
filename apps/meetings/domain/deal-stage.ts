/** The stages of the simulated CRM pipeline, in order. */
export const dealStages = ["Discovery", "Proposal drafted", "Proposal sent", "Won", "Lost"] as const;

export type DealStage = (typeof dealStages)[number];

/** Every call that reaches the outputs has a drafted proposal, so that is where a new deal starts. */
export const stageAfterCall: DealStage = "Proposal drafted";

export const stageAfterSend: DealStage = "Proposal sent";

/** Maps a stage name from the model (lead, qualified, proposal, won, lost) or the app to a deal stage. */
export function normaliseStage(text: string): DealStage {
  const value = text.trim().toLowerCase();
  const exact = dealStages.find((stage) => stage.toLowerCase() === value);
  if (exact) return exact;
  if (value === "won") return "Won";
  if (value === "lost") return "Lost";
  return stageAfterCall;
}
