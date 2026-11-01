/** The five lanes of the demo. The film shows all five; live mode replaces the call lane with the input. */
export const laneIds = ["call", "ai", "crm", "proposal", "calendar"] as const;

export type LaneId = (typeof laneIds)[number];

/** `tab` is the short name a phone shows in the row of lane tabs. */
export type LaneDefinition = { id: LaneId; label: string; role: string; tab: string };

export const lanes: readonly LaneDefinition[] = [
  { id: "call", label: "Call", role: "Discovery call", tab: "Call" },
  { id: "ai", label: "AI", role: "Reads the call", tab: "AI" },
  { id: "crm", label: "CRM", role: "Pipeline", tab: "CRM" },
  { id: "proposal", label: "Proposal and email", role: "Drafts to send", tab: "Proposal" },
  { id: "calendar", label: "Calendar", role: "Week view", tab: "Calendar" },
];

export function laneById(id: LaneId): LaneDefinition {
  const lane = lanes.find((entry) => entry.id === id);
  if (!lane) throw new Error(`Unknown lane "${id}"`);
  return lane;
}
