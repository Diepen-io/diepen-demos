import type { FilmLayout } from "@diepen/ui/film/film-layout";
import type { FilmLane } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";

/** The four parties of live mode, in the order that keeps the busiest paths short. */
export function documentsLanes(profile: CompanyProfile): FilmLane[] {
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
 */
export const documentsLayout: FilmLayout = {
  columns: [
    { lanes: ["firm"], width: "30fr" },
    { lanes: ["client"], width: "21fr" },
    { lanes: ["system"], width: "22fr" },
    { lanes: ["drive"], width: "27fr" },
  ],
};

/** The same columns for the live page's own grid. */
export const documentsGridColumns = documentsLayout.columns.map((column) => `minmax(0,${column.width ?? "1fr"})`).join(" ");
