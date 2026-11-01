import type { DealStage } from "./deal-stage";

/**
 * What one call turns into, as this app shows it. It is the shape of the `call-outputs` task in
 * `@diepen/voice`, except that the CRM stage is one of the app's own deal stages.
 */
export type MeetingOutputs = {
  summary: string;
  numbers: { label: string; value: string }[];
  painPoints: string[];
  crm: {
    company: string;
    contactName: string;
    contactRole: string;
    email?: string;
    phone?: string;
    stage: DealStage;
    dealValue: string;
    nextStep: string;
  };
  proposal: { title: string; scope: string[]; price: string; timeline: string; terms: string };
  followUpEmail: { subject: string; body: string };
  nextMeeting: { title: string; durationMinutes: number; start: string; agenda: string[] };
};
