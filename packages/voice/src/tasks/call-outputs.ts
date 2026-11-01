import type { ObjectRequest } from "@diepen/ai/provider";
import { z } from "zod";
import type { CompanyProfile } from "../profile.ts";
import { buildSystemPrompt } from "../prompt.ts";
import type { TaskSpec } from "../task-spec.ts";

export type CallOutputsContext = {
  /** The company's local time as an ISO date-time with offset. The next meeting is planned from it. */
  localNow: string;
  /** Free calendar slots as ISO date-times. Without them the model picks a time in opening hours. */
  openSlots?: readonly string[];
};

const figure = z.object({ label: z.string(), value: z.string() });

export const callOutputsSchema = z.object({
  summary: z.string().describe("Three to five sentences: who called, what they need, what was agreed."),
  numbers: z.array(figure).describe("Every figure the prospect gave, as they said it."),
  painPoints: z.array(z.string()),
  crm: z.object({
    company: z.string(),
    contactName: z.string(),
    contactRole: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    stage: z.enum(["lead", "qualified", "proposal", "won", "lost"]),
    dealValue: z.string().describe("The proposal price, or 'Not priced yet'."),
    nextStep: z.string(),
  }),
  proposal: z.object({
    title: z.string(),
    scope: z.array(z.string()),
    price: z.string().describe("Built only from listed service prices, with the calculation shown."),
    timeline: z.string(),
    terms: z.string(),
  }),
  followUpEmail: z.object({ subject: z.string(), body: z.string() }),
  nextMeeting: z.object({
    title: z.string(),
    durationMinutes: z.number().int(),
    start: z.string().describe("An ISO 8601 date-time."),
    agenda: z.array(z.string()),
  }),
});

export type CallOutputs = z.infer<typeof callOutputsSchema>;

export const callOutputsTask: TaskSpec<CallOutputsContext, CallOutputs> = {
  id: "call-outputs",
  role: "analysis",
  instructions: () =>
    [
      "The last message is the transcript of a sales call between the company and a prospect. Turn it into the outputs the team needs after the call.",
      "",
      "- summary, numbers and painPoints: only what the prospect said. Do not add figures.",
      "- crm: the prospect's company and contact as said in the call. Leave email and phone out when nobody said them. Use stage qualified when the prospect wants a proposal.",
      "- proposal: scope from the company's listed services that match the prospect's needs. Build the price only from the listed service prices and show the calculation, for example '12 units x EUR 34 per month = EUR 408 per month'. When no listed price fits, write 'Price after a short call with the team' and never invent one.",
      "- followUpEmail: from the company to the prospect, in the company's tone and with the sign-off. Thank them, restate the two or three things that matter most to them, name the proposal and the next meeting.",
      "- nextMeeting: use the first open slot that suits what was agreed. Without open slots, use the next working day at 10:00 after localNow, inside the opening hours, with the same UTC offset as localNow. Use the booking length as durationMinutes unless the call agreed another length.",
    ].join("\n"),
  outputSchema: callOutputsSchema,
};

export type CallOutputsRequestInput = {
  profile: CompanyProfile;
  transcript: string;
  localNow: string;
  openSlots?: readonly string[];
  /** What the mock provider returns. The app's use case passes a fixture, so keyless runs stay deterministic. */
  mock: () => CallOutputs;
};

/** The complete request for the analysis model. The transcript goes in the user message, as data. */
export function buildCallOutputsRequest({
  profile,
  transcript,
  localNow,
  openSlots,
  mock,
}: CallOutputsRequestInput): ObjectRequest<CallOutputs> {
  return {
    role: callOutputsTask.role,
    system: buildSystemPrompt({ profile, task: callOutputsTask, context: { localNow, openSlots } }),
    messages: [{ role: "user", content: `Call transcript:\n${transcript}` }],
    schema: callOutputsSchema,
    mock,
  };
}
