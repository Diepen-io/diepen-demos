import { filmSession } from "@/test-support/live-sessions";
import type { CompanyProfile } from "@diepen/voice/profile";
import { describe, expect, it } from "vitest";
import { escalationTask, followUpEmail, reminderEmail, requestEmail } from "./chase-emails";
import { clientReason } from "./client-reasons";
import { createTaxReturnRequest } from "./document-request";
import type { LiveSession } from "./live-session";

/** A fictional firm. The domain may not import the presets, so the test brings its own profile. */
const profile: CompanyProfile = {
  id: "harbour-tax",
  name: "Harbour Tax Studio",
  fictional: true,
  industry: "Tax and accounting firm",
  tagline: "Tax returns for employees.",
  website: "https://harbour-tax.example",
  logo: { kind: "monogram", text: "HT" },
  colors: { brand: "#0f766e", brandForeground: "#ffffff" },
  people: { owner: { name: "Ines Hart", role: "Tax adviser" }, assistantName: "Nora from Harbour" },
  voice: { tone: "Calm and exact.", wordsToUse: [], wordsToAvoid: [], signOff: "Best wishes,\nNora from Harbour Tax Studio" },
  policies: { mayPromise: [], neverPromise: [], handoverWhen: [], handoverMessage: "A tax adviser will call you." },
  knowledge: {
    services: [{ name: "Income tax return for employees", description: "Annual return.", price: "from EUR 250" }],
    openingHours: "Mon to Fri 9:00 to 17:00",
    contactEmail: "hello@harbour-tax.example",
    faq: [],
    bookingMinutes: 30,
  },
};

const request = createTaxReturnRequest("2026-03-09T09:00");
const labels = Object.fromEntries(request.items.map((item) => [item.id, item.label]));

function outstandingOf(session: LiveSession) {
  return session.items
    .filter((state) => state.state === "missing" || state.state === "problem")
    .map((state) => {
      const item = request.items.find((candidate) => candidate.id === state.id);
      if (!item) throw new Error(`No item ${state.id}`);
      return { itemId: item.id, reason: clientReason(item, state) };
    });
}

const filmOutstanding = outstandingOf(filmSession());
const dashes = /[–—]/;

describe("followUpEmail @documents.chase", () => {
  const email = followUpEmail(profile, filmOutstanding);

  it("lists exactly the bank, home office and health insurance items with their client reasons", () => {
    expect(filmOutstanding.map((entry) => entry.itemId)).toEqual(["bank-interest", "home-office", "health-insurance"]);
    expect(email.body).toContain(labels["bank-interest"]);
    expect(email.body).toContain("You sent the one for 2024.");
    expect(email.body).toContain(labels["home-office"]);
    expect(email.body).toContain("The signature is missing.");
    expect(email.body).toContain(labels["health-insurance"]);
    expect(email.body).toContain("Not received yet.");
    for (const done of ["engagement-letter", "payslip-summary", "donation-receipt"]) {
      expect(email.body).not.toContain(labels[done]);
    }
    expect(email.body.match(/^\s*\d+\.\s/gm)).toHaveLength(3);
  });

  it("says 3 documents in the subject", () => {
    expect(email.subject).toContain("3 documents");
  });

  it("ends with the profile's sign-off", () => {
    expect(email.body.trimEnd().endsWith(profile.voice.signOff)).toBe(true);
  });
});

describe("clientReason @documents.chase", () => {
  const item = request.items.find((candidate) => candidate.id === "payslip-summary");
  if (!item) throw new Error("No payslip item");
  const state = (kind: string | null, extra: Partial<LiveSession["items"][number]> = {}) => ({
    id: item.id,
    state: kind ? ("problem" as const) : ("missing" as const),
    issues: kind ? [{ kind: kind as LiveSession["items"][number]["issues"][number]["kind"] }] : [],
    detectedYear: 2025,
    detectedPerson: "Daniel Okafor",
    ...extra,
  });

  it("gives one line per issue kind, first issue first", () => {
    expect(clientReason(item, state(null))).toBe("Not received yet.");
    expect(clientReason(item, state("wrong_year", { detectedYear: 2024 }))).toBe("You sent the one for 2024.");
    expect(clientReason(item, state("wrong_person", { detectedPerson: "Amara Okafor" }))).toBe("The file you sent is for Amara Okafor.");
    expect(clientReason(item, state("missing_signature"))).toBe("The signature is missing.");
    expect(clientReason(item, state("missing_page"))).toBe("A page is missing.");
    expect(clientReason(item, state("wrong_document"))).toBe("The file you sent is a different document.");
    expect(clientReason(item, state("unreadable"))).toBe("Part of it cannot be read. A sharper scan or photo helps.");
    expect(clientReason(item, state("other"))).toBe("We need a new copy.");
    const two = { ...state("missing_page"), issues: [{ kind: "missing_page" as const }, { kind: "wrong_year" as const }] };
    expect(clientReason(item, two)).toBe("A page is missing.");
  });
});

describe("composed text has no em or en dash @documents.chase", () => {
  it("holds for every email, task and reason", () => {
    const everyItem = request.items.map((item) => ({ itemId: item.id, reason: "Not received yet." }));
    const texts = [
      requestEmail(profile, everyItem),
      followUpEmail(profile, filmOutstanding),
      reminderEmail(profile, filmOutstanding),
      escalationTask(profile, filmOutstanding),
      ...filmOutstanding.map((entry) => entry.reason),
    ];
    for (const text of texts) expect(JSON.stringify(text)).not.toMatch(dashes);
  });

  it("names the client in the escalation task", () => {
    expect(JSON.stringify(escalationTask(profile, filmOutstanding))).toContain("Call Daniel Okafor");
  });
});
