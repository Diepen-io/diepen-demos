import type { FilmLayout } from "@diepen/ui/film/film-layout";
import type { FilmLane } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";

/** The four parties of the film and of live mode, in the order that keeps the busiest paths short. */
export function documentsLanes(profile: CompanyProfile): FilmLane[] {
  return [
    { id: "firm", label: profile.name, role: profile.industry, icon: "briefcase", brand: true },
    { id: "client", label: "Daniel Okafor", role: "Client", icon: "user" },
    { id: "system", label: "Document chaser", role: "Automation", icon: "sparkle" },
    { id: "drive", label: "Drive", role: "Client folder", icon: "folder" },
  ];
}

export type DocumentsLaneId = "firm" | "client" | "system" | "drive";

/** Firm 30%, client 22% (a phone), system and Drive 24% each. */
export const documentsLayout: FilmLayout = {
  columns: [
    { lanes: ["firm"], width: "30fr" },
    { lanes: ["client"], width: "22fr" },
    { lanes: ["system"], width: "24fr" },
    { lanes: ["drive"], width: "24fr" },
  ],
};

export const documentsGridColumns = "minmax(0,30fr) minmax(0,22fr) minmax(0,24fr) minmax(0,24fr)";
