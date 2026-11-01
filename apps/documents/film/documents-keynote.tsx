import { KeynoteFileStack, KeynoteNotification, KeynoteRow } from "@diepen/ui/film/keynote-parts";
import { defineKeynoteFilm, type KeynoteFilm } from "@diepen/ui/film/keynote-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { chasingHoursAfter, chasingHoursBefore, exampleMonth, formatHours } from "@/domain/chase-hours";
import { client, itemIds, type ItemId } from "@/domain/document-request";

/** The six requested documents as a client would name them, short enough for one file chip each. */
const shortNames: Record<ItemId, string> = {
  "engagement-letter": "Engagement letter",
  "payslip-summary": "Payslip summary",
  "bank-interest": "Bank interest",
  "donation-receipt": "Donation receipt",
  "home-office": "Home office form",
  "health-insurance": "Health insurance",
};

/** The document chaser film as five keynote beats: one element on screen at a time (decision F2). */
export function buildDocumentsKeynote(profile: CompanyProfile): KeynoteFilm {
  return defineKeynoteFilm({
    id: "documents",
    title: "Document chaser",
    beats: [
      {
        id: "uploads",
        caption: "Your client uploads 6 files.",
        element: <KeynoteFileStack names={itemIds.map((id) => shortNames[id])} />,
      },
      {
        id: "checked",
        caption: "Each one checked automatically.",
        element: <KeynoteRow title={shortNames["payslip-summary"]} status="pass" />,
      },
      {
        id: "problem",
        caption: "Problems caught instantly.",
        element: <KeynoteRow title={shortNames["home-office"]} status="fail" />,
        chip: { label: "Signature missing", tone: "fail" },
      },
      {
        id: "reminder",
        caption: "Reminders go out on their own.",
        element: (
          <KeynoteNotification
            icon="mail"
            app={`${profile.name} · Email`}
            title="3 documents still open"
            body={`${client.name} gets a reminder on day 3.`}
          />
        ),
      },
    ],
    finale: {
      label: "Hours a month chasing documents",
      before: formatHours(chasingHoursBefore()),
      after: formatHours(chasingHoursAfter()),
      note: `A simulation with ${profile.name}, a fictional firm. Example month: ${exampleMonth.returns}\u00a0tax returns with ${exampleMonth.chasesPerReturn} chases of ${exampleMonth.minutesPerChase} minutes each, against ${exampleMonth.minutesPerSummary} minutes per return to read the summary.`,
    },
  });
}
