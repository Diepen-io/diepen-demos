import type { AiProvider } from "@diepen/ai/provider";
import type { CompanyProfile } from "@diepen/voice/profile";
import { buildCallOutputsRequest, type CallOutputs } from "@diepen/voice/tasks/call-outputs";
import { normaliseStage } from "@/domain/deal-stage";
import type { MeetingOutputs } from "@/domain/meeting-outputs";
import { proposalService } from "@/domain/proposal-service";
import { checkTranscript, parseTranscript, type TranscriptIssue } from "@/domain/transcript";
import { draftMockOutputs } from "./draft-mock-outputs";

export type ProcessCallInput = {
  transcript: string;
  profile: CompanyProfile;
  /** The visitor's wall clock, so "Friday at ten" resolves in their week. */
  localNow: string;
};

export type ProcessCallPorts = { ai: AiProvider };

/** One structured answer holds all six outputs, so they agree with each other. */
const maxOutputTokens = 2_000;

/** The transcript breaks a limit. Routes check first, so this only guards direct callers. */
export class TranscriptRejectedError extends Error {
  override readonly name = "TranscriptRejectedError";

  constructor(readonly issues: TranscriptIssue[]) {
    super(issues.map((issue) => issue.message).join(" "));
  }
}

/**
 * Turns a call transcript into a summary, numbers, pain points, CRM record, proposal, follow-up
 * email and next meeting. Price and meeting length come from the profile, whatever the model says.
 */
export async function processCall({ transcript, profile, localNow }: ProcessCallInput, { ai }: ProcessCallPorts): Promise<MeetingOutputs> {
  const issues = checkTranscript(transcript);
  if (issues.length > 0) throw new TranscriptRejectedError(issues);
  const turns = parseTranscript(transcript);

  const request = buildCallOutputsRequest({
    profile,
    transcript: transcript.trim(),
    localNow,
    mock: () => draftMockOutputs({ turns, profile, localNow }),
  });
  const outputs = await ai.generateObject({ ...request, maxTokens: maxOutputTokens });
  return withProfileRules(outputs, profile);
}

function withProfileRules(outputs: CallOutputs, profile: CompanyProfile): MeetingOutputs {
  return {
    ...outputs,
    crm: { ...outputs.crm, stage: normaliseStage(outputs.crm.stage) },
    proposal: { ...outputs.proposal, price: proposalService(profile).price },
    nextMeeting: { ...outputs.nextMeeting, durationMinutes: profile.knowledge.bookingMinutes },
  };
}
