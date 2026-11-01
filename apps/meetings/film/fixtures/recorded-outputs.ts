import type { MeetingOutputs } from "@/domain/meeting-outputs";

/**
 * What the AI drafted from the sample call, recorded so the film runs with no key and no network.
 * Tokens are filled from the active profile when the film is built.
 */
export const recordedOutputs: MeetingOutputs = {
  summary:
    "Tom Becker and his wife Anna own 14 apartments in three buildings and manage them themselves, about nine hours a week next to Tom's job. " +
    "Night repair calls are the worst part, apartments stood empty 38 days on average across six move-outs last year, and two tenants pay late most months. " +
    "He wants the proposal in writing today, decides with Anna, and wants to start on 1 January.",
  numbers: [
    { label: "Apartments", value: "14" },
    { label: "Hours a week on tenants", value: "9" },
    { label: "Days empty between tenants", value: "38" },
    { label: "Move-outs last year", value: "6" },
    { label: "Average rent a month", value: "1,150" },
    { label: "Rent lost to empty days last year", value: "about 8,700" },
  ],
  painPoints: [
    "Nine hours a week on tenants, next to a full-time job",
    "Night and weekend repair calls, and the plumber is off on weekends",
    "Apartments stand empty 38 days because viewings only happen on Saturdays",
  ],
  crm: {
    company: "Becker Residential",
    contactName: "Tom Becker",
    contactRole: "Owner",
    email: "tom@becker-residential.example",
    stage: "Proposal drafted",
    dealValue: "{servicePrice}, 14 apartments",
    nextStep: "Send the proposal today. Walk the three buildings on Friday 13 November at 10:00.",
  },
  proposal: {
    title: "{serviceName} for Becker Residential",
    scope: [
      "Tenant calls and repairs for all 14 apartments, nights and weekends included",
      "Viewings within five days of a move-out notice",
      "Rent collection and reminders, with one owner statement a month",
      "Tom and Anna meet the final two candidates for every apartment and choose",
    ],
    price: "{servicePrice}",
    timeline: "Handover in December, {sellerCompany} takes over on 1 January 2027",
    terms: "Valid for 30 days.",
  },
  followUpEmail: {
    subject: "Your proposal from {sellerCompany}",
    body:
      "Hi Tom,\n\n" +
      "Thanks for the call today. What I heard: 14 apartments in three buildings, about nine hours a week of your time, and 38 empty days on average between tenants.\n\n" +
      "The proposal is attached. We take the tenant calls and repairs, nights included, run viewings within five days of a notice, and send you one statement a month. You and Anna still choose every tenant. {serviceName} is {servicePrice}, starting 1 January.\n\n" +
      "Friday at 10:00 is in the calendar to walk the three buildings. Bring Anna if she can make it.\n\n" +
      "{signOffGreeting}\n{sellerSignature}",
  },
  nextMeeting: {
    title: "Walkthrough with Tom Becker",
    // Replaced by the profile's booking length when the film is built.
    durationMinutes: 0,
    start: "2026-11-13T10:00:00",
    agenda: ["Walk all three buildings", "Look at the boilers and the repair history", "Agree the handover date with Anna"],
  },
};
