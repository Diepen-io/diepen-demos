import type { IconName } from "../primitives/icon";

/** One party in a lane layout, as live mode shows them side by side. */
export type FilmLane = {
  id: string;
  /** The party, for example "Maya Fischer" or "Ledgerwick Tax & Accounting". */
  label: string;
  /** What the party is in the story, for example "Client" or "Automation". */
  role: string;
  /** A short name for the narrow layout's tabs. Defaults to `role`. */
  tabLabel?: string;
  icon?: IconName;
  /** The business acts in this lane, so its accents use the brand colour. */
  brand?: boolean;
};
