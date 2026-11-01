import { defineFilmScript, type FilmBeat, type FilmScript, type FilmTravel } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { documentsLanes } from "@/ui/documents-lanes";
import type { DocumentsBeat } from "./documents-beat";

/**
 * The 72 second film: Daniel Okafor's 2025 tax return from the request to the complete checklist.
 * The firm and its owner come from the profile; everything else is recorded and fixed.
 */

const payslip = "payslip-summary-2025.pdf";
const bank2024 = "bank-interest-statement-2024.pdf";
const donation = "donation-receipt-2025.pdf";
const homeOfficeUnsigned = "home-office-confirmation-2025-unsigned.pdf";
const bank2025 = "bank-interest-statement-2025.pdf";
const homeOfficeSigned = "home-office-confirmation-2025-signed.pdf";
const health = "health-insurance-statement-2025.png";

type Beat = FilmBeat<DocumentsBeat>;

const travel = (from: string, kind: FilmTravel["kind"], label: string): FilmTravel => ({ from, kind, label });

function beat(id: number, at: number, lane: string, data: DocumentsBeat, extra: { caption?: string; travel?: FilmTravel } = {}): Beat {
  return { id: `beat-${id}`, at, lane, data, ...extra };
}

function filed(id: number, at: number, data: Extract<DocumentsBeat, { kind: "filed" }>, from: string, caption?: string): Beat {
  return beat(id, at, "drive", data, { travel: travel(from, "document", data.fileName), caption });
}

function beats(profile: CompanyProfile): Beat[] {
  const firm = profile.name;
  const owner = profile.people.owner.name;
  return [
    beat(1, 0, "firm", { kind: "checklist", changes: [] }, { caption: `${firm} needs 6 documents for Daniel's 2025 tax return.` }),
    beat(2, 3000, "client", { kind: "email", email: "request", open: false }, {
      caption: "One click sends the request.",
      travel: travel("firm", "message", "Your 2025 tax return: 6 documents"),
    }),
    beat(3, 5000, "client", { kind: "email", email: "request", open: true }, { caption: "Daniel gets one email with one link." }),
    beat(4, 8000, "client", { kind: "upload-page" }, { caption: "The link opens a page with his 6 items." }),
    beat(5, 10500, "client", { kind: "signature" }, { caption: "He signs the engagement letter right on the page." }),
    filed(6, 13000, { kind: "filed", itemId: "engagement-letter", fileName: "2025_Okafor-Daniel_Engagement-letter_signed.pdf", status: "ok" }, "client", "The signed copy lands in Drive, named and filed."),
    beat(7, 14200, "firm", { kind: "checklist", changes: [{ itemId: "engagement-letter", event: "signed" }] }, { travel: travel("client", "event", "Signed") }),
    beat(8, 16000, "client", {
      kind: "files-dropped",
      files: [
        { itemId: "payslip-summary", fileName: payslip },
        { itemId: "bank-interest", fileName: bank2024 },
        { itemId: "donation-receipt", fileName: donation },
        { itemId: "home-office", fileName: homeOfficeUnsigned },
      ],
    }, { caption: "He adds 4 files from his phone." }),
    ...[payslip, bank2024, donation, homeOfficeUnsigned].map((fileName, index) =>
      beat(9 + index, 16600 + index * 300, "system", { kind: "check", fileNames: [fileName], step: "arrived" }, { travel: travel("client", "document", fileName) }),
    ),
    beat(13, 17800, "firm", {
      kind: "checklist",
      changes: (["payslip-summary", "bank-interest", "donation-receipt", "home-office"] as const).map((itemId) => ({ itemId, event: "uploaded" as const })),
    }, { travel: travel("system", "event", "4 received") }),
    beat(14, 20000, "system", { kind: "check", fileNames: [payslip], step: "result" }, { caption: "Each file is read: type, name, year, pages, signature." }),
    filed(15, 21500, { kind: "filed", itemId: "payslip-summary", fileName: "2025_Okafor-Daniel_Payslip-summary.pdf", status: "ok" }, "system"),
    beat(16, 22300, "firm", { kind: "checklist", changes: [{ itemId: "payslip-summary", event: "checkPassed" }] }, { travel: travel("system", "event", "Checked") }),
    beat(17, 24000, "system", { kind: "check", fileNames: [bank2024], step: "result" }, { caption: "Wrong year caught. This is his 2024 bank statement." }),
    filed(18, 25500, { kind: "filed", itemId: "bank-interest", fileName: "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf", status: "problem" }, "system"),
    beat(19, 26300, "firm", { kind: "checklist", changes: [{ itemId: "bank-interest", event: "checkFailed" }] }, { travel: travel("system", "event", "Problem found") }),
    beat(20, 27500, "system", { kind: "check", fileNames: [donation], step: "result" }, { caption: "Key numbers come out of every document." }),
    filed(21, 28800, { kind: "filed", itemId: "donation-receipt", fileName: "2025_Okafor-Daniel_Donation-receipt.pdf", status: "ok" }, "system"),
    beat(22, 29600, "firm", { kind: "checklist", changes: [{ itemId: "donation-receipt", event: "checkPassed" }] }, { travel: travel("system", "event", "Checked") }),
    beat(23, 31000, "system", { kind: "check", fileNames: [homeOfficeUnsigned], step: "result" }, { caption: "The home office form is missing his employer's signature." }),
    filed(24, 32300, { kind: "filed", itemId: "home-office", fileName: "2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf", status: "problem" }, "system"),
    beat(25, 33100, "firm", { kind: "checklist", changes: [{ itemId: "home-office", event: "checkFailed" }] }, { travel: travel("system", "event", "Problem found") }),
    beat(26, 34500, "firm", { kind: "summary" }, { caption: `${owner} reads one summary instead of opening 4 files.` }),
    beat(27, 37500, "client", { kind: "email", email: "follow-up", open: true }, {
      caption: "The follow-up names exactly what is missing and why.",
      travel: travel("system", "message", "3 documents still needed"),
    }),
    beat(28, 41000, "system", { kind: "schedule", title: "Reminder 2", from: "2026-03-09T12:50", dueAt: "2026-03-12T12:50" }, { caption: "Three days pass. Nothing comes back." }),
    beat(29, 45500, "client", { kind: "email", email: "reminder", open: true }, {
      caption: "Day 3: the second reminder goes out on its own.",
      travel: travel("system", "message", "Reminder: 3 documents still open"),
    }),
    beat(30, 49000, "client", {
      kind: "files-dropped",
      files: [
        { itemId: "bank-interest", fileName: bank2025 },
        { itemId: "home-office", fileName: homeOfficeSigned },
        { itemId: "health-insurance", fileName: health },
      ],
    }, { caption: "Daniel sends the last 3 that evening." }),
    ...[bank2025, homeOfficeSigned, health].map((fileName, index) =>
      beat(31 + index, 49600 + index * 300, "system", { kind: "check", fileNames: [fileName], step: "arrived" }, { travel: travel("client", "document", fileName) }),
    ),
    beat(34, 51000, "firm", {
      kind: "checklist",
      changes: (["bank-interest", "home-office", "health-insurance"] as const).map((itemId) => ({ itemId, event: "uploaded" as const })),
    }, { travel: travel("system", "event", "3 received") }),
    beat(35, 52500, "system", { kind: "check", fileNames: [bank2025, homeOfficeSigned, health], step: "result", compact: true }),
    filed(36, 53500, { kind: "filed", itemId: "bank-interest", fileName: "2025_Okafor-Daniel_Bank-interest-statement.pdf", status: "ok" }, "system", "All 3 pass. The old files move to Replaced."),
    filed(37, 54000, { kind: "filed", itemId: "home-office", fileName: "2025_Okafor-Daniel_Home-office-confirmation.pdf", status: "ok" }, "system"),
    filed(38, 54500, { kind: "filed", itemId: "health-insurance", fileName: "2025_Okafor-Daniel_Health-insurance-statement.png", status: "ok" }, "system"),
    beat(39, 55500, "firm", {
      kind: "checklist",
      changes: (["bank-interest", "home-office", "health-insurance"] as const).map((itemId) => ({ itemId, event: "checkPassed" as const })),
    }, { travel: travel("system", "event", "3 checked") }),
    beat(40, 57500, "firm", { kind: "complete" }, { caption: "Every document is in, checked and filed." }),
  ];
}

export function documentsFilm(profile: CompanyProfile): FilmScript<DocumentsBeat> {
  return defineFilmScript<DocumentsBeat>({
    id: "documents",
    title: "Daniel Okafor's 2025 tax return",
    durationMs: 72_000,
    lanes: documentsLanes(profile),
    clock: [
      { at: 0, time: "2026-03-09T09:00" },
      { at: 4500, time: "2026-03-09T09:00", curve: "linear" },
      { at: 7000, time: "2026-03-09T12:40", curve: "ease" },
      { at: 16000, time: "2026-03-09T12:44", curve: "linear" },
      { at: 37000, time: "2026-03-09T12:50", curve: "linear" },
      { at: 41000, time: "2026-03-09T12:50", curve: "linear" },
      { at: 45000, time: "2026-03-12T12:50", curve: "ease" },
      { at: 47500, time: "2026-03-12T12:50", curve: "linear" },
      { at: 49000, time: "2026-03-12T19:20", curve: "ease" },
      { at: 60000, time: "2026-03-12T19:24", curve: "linear" },
    ],
    beats: beats(profile),
    end: {
      at: 61_000,
      metric: "Hours a month spent chasing documents",
      before: "12 hours",
      after: "1 hour",
      lines: ["Each upload is checked as it arrives.", "Follow-ups name the exact document and the reason."],
      note: "Simulation with a fictional firm and client. Before: an example calculation for 40 tax returns a month, 3 chases each, 6 minutes per chase. After: 1.5 minutes per return to read the summary.",
    },
  });
}
