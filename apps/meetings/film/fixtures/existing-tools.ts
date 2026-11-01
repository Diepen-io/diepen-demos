import type { DealStage } from "@/domain/deal-stage";

/** Fictional deals already in the CRM before the call, so the tool looks lived in. */
export type ExistingDeal = { company: string; contact: string; stage: DealStage; value: string };

export const existingDeals: readonly ExistingDeal[] = [
  { company: "Hartley Lofts", contact: "Priya Nair", stage: "Proposal sent", value: "22 units" },
  { company: "Ines Ortega", contact: "Private owner", stage: "Discovery", value: "3 units" },
];

/** Fictional events already in the week of 9 to 13 November 2026. */
export type WeekEvent = { id: string; start: string; durationMinutes: number; title: string };

export const existingEvents: readonly WeekEvent[] = [
  { id: "team-check-in", start: "2026-11-09T09:00:00", durationMinutes: 30, title: "Team check-in" },
  { id: "mill-lane-viewing", start: "2026-11-11T15:00:00", durationMinutes: 30, title: "Viewing, Mill Lane 7" },
  { id: "owner-statements", start: "2026-11-12T11:00:00", durationMinutes: 60, title: "Owner statements" },
];

/** The Monday the film's calendar week starts on. */
export const filmWeekStart = "2026-11-09";
