import type { DriveTree } from "@/domain/drive-folder";
import type { LiveSession } from "@/domain/live-session";

/**
 * Sessions and readers the unit tests share. The film session is the state after Daniel's first
 * batch in the film: signed letter, payslip and donation checked, bank statement for the wrong
 * year, home office form unsigned, health insurance not sent yet.
 */

type SessionItem = LiveSession["items"][number];

const sentAt = "2026-03-09T09:00";

const filmItems: SessionItem[] = [
  { id: "engagement-letter", state: "checked", issues: [], detectedYear: null, detectedPerson: null },
  { id: "payslip-summary", state: "checked", issues: [], detectedYear: 2025, detectedPerson: "Daniel Okafor" },
  { id: "bank-interest", state: "problem", issues: [{ kind: "wrong_year" }], detectedYear: 2024, detectedPerson: "Daniel Okafor" },
  { id: "donation-receipt", state: "checked", issues: [], detectedYear: 2025, detectedPerson: "Daniel Okafor" },
  { id: "home-office", state: "problem", issues: [{ kind: "missing_signature" }], detectedYear: 2025, detectedPerson: "Daniel Okafor" },
  { id: "health-insurance", state: "missing", issues: [], detectedYear: null, detectedPerson: null },
];

export function filmSession(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    requestId: "okafor-2025",
    sentAt,
    now: "2026-03-09T12:50",
    items: filmItems.map((item) => ({ ...item, issues: [...item.issues] })),
    chases: [],
    jobs: [],
    escalated: false,
    ...overrides,
  };
}

export function completeSession(overrides: Partial<LiveSession> = {}): LiveSession {
  return filmSession({
    items: filmItems.map((item) => ({ ...item, state: "checked", issues: [] })),
    ...overrides,
  });
}

/** Story time as epoch ms. Story times carry no zone, so they read as UTC, as the film clock does. */
export function storyMs(time: string): number {
  return Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(time) ? time : `${time}Z`);
}

export const dayMs = 24 * 60 * 60 * 1000;

/** The folders that hold files, in tree order, with their file names in order. */
export function driveListing(tree: DriveTree): [string, string[]][] {
  return tree.folders
    .filter((folder) => folder.files.length > 0)
    .map((folder) => [folder.name, folder.files.map((file) => file.name)]);
}
