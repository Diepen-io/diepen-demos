/** The four tool lanes of live mode, where the call's outputs land. */
export const laneIds = ["ai", "crm", "proposal", "calendar"] as const;

export type LaneId = (typeof laneIds)[number];

export type LaneDefinition = { id: LaneId; label: string; role: string };

export const lanes: readonly LaneDefinition[] = [
  { id: "ai", label: "AI", role: "Reads the call" },
  { id: "crm", label: "CRM", role: "Your list of deals" },
  { id: "proposal", label: "Proposal and email", role: "Ready to send" },
  { id: "calendar", label: "Calendar", role: "This week" },
];

export function laneById(id: LaneId): LaneDefinition {
  const lane = lanes.find((entry) => entry.id === id);
  if (!lane) throw new Error(`Unknown lane "${id}"`);
  return lane;
}
