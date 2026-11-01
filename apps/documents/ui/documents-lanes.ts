import type { IconName } from "@diepen/ui/primitives/icon";
import type { CompanyProfile } from "@diepen/voice/profile";

/** One party in live mode, shown side by side with the others. */
export type LiveLane = {
  id: DocumentsLaneId;
  /** The party, for example "Daniel Okafor" or "Ledgerwick Tax & Accounting". */
  label: string;
  /** What the party is in the story, for example "Client" or "Automation". */
  role: string;
  /** A short name for the narrow layout's tabs. */
  tabLabel: string;
  icon: IconName;
  /** The business acts in this lane, so its accents use the brand colour. */
  brand?: boolean;
};

/** The four parties of live mode, in the order that keeps the busiest paths short. */
export function documentsLanes(profile: CompanyProfile): LiveLane[] {
  return [
    { id: "firm", label: profile.name, role: profile.industry, tabLabel: "Firm", icon: "briefcase", brand: true },
    { id: "client", label: "Daniel Okafor", role: "Client", tabLabel: "Client", icon: "user" },
    { id: "system", label: "Document chaser", role: "Automation", tabLabel: "System", icon: "sparkle" },
    { id: "drive", label: "Drive", role: "Client folder", tabLabel: "Drive", icon: "folder" },
  ];
}

export type DocumentsLaneId = "firm" | "client" | "system" | "drive";

/**
 * The phone is as wide as the lane height allows, so the client lane needs little more than that.
 * Firm and Drive get the most room: the checklist rows and the long file names read on one or two lines.
 * Fractions get a zero minimum so long words never widen a column.
 */
export const documentsGridColumns = ["30fr", "21fr", "22fr", "27fr"].map((width) => `minmax(0,${width})`).join(" ");
