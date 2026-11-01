import type { AiProvider, ObjectRequest } from "@diepen/ai/provider";
import { callOutputsSchema, type CallOutputs } from "@diepen/voice/tasks/call-outputs";
import { describe, expect, it } from "vitest";
import { meetingsOutputsSchema } from "@/test-support/meetings-outputs-schema";
import { createMockProvider } from "@/test-support/mock-provider";
import { filledSampleCall } from "@/test-support/sample-call";
import { meetingsPreset, testProfile } from "@/test-support/test-profile";
import { processCall } from "./process-call";

const localNow = "2026-11-10T14:32:10";
const presetPrice = meetingsPreset.knowledge.services.find((service) => service.price)?.price;

// U9
describe("processCall with the mock provider @meetings.live-sample", () => {
  const run = () =>
    processCall({ transcript: filledSampleCall(meetingsPreset), profile: meetingsPreset, localNow }, { ai: createMockProvider() });

  it("turns the sample call into outputs that pass the call-outputs schema", async () => {
    const outputs = await run();
    expect(meetingsOutputsSchema.safeParse(outputs).success).toBe(true);
    expect(outputs.crm.stage).toBe("Proposal drafted");
  });

  it("finds Tom Becker, his numbers and his pain points", async () => {
    const outputs = await run();
    expect(outputs.crm.contactName).toBe("Tom Becker");
    expect(outputs.crm.company).toBe("Becker Residential");
    expect(outputs.crm.email).toBe("tom@becker-residential.example");
    expect(outputs.numbers).toEqual([
      { label: "Apartments across three buildings", value: "14" },
      { label: "Days empty", value: "38" },
      { label: "Average rent a month", value: "EUR 1,150" },
    ]);
    expect(outputs.painPoints).toEqual([
      "A normal week, about nine hours.",
      "Calls, texts, chasing the plumber, chasing rent.",
      "The night calls are the worst part.",
    ]);
  });

  it("uses the preset's price and meeting length", async () => {
    const outputs = await run();
    expect(presetPrice).toBe("EUR 34 per unit per month");
    expect(outputs.proposal.price).toBe(presetPrice);
    expect(outputs.nextMeeting.durationMinutes).toBe(meetingsPreset.knowledge.bookingMinutes);
  });

  it("answers the same for the same transcript, profile and localNow", async () => {
    expect(await run()).toEqual(await run());
  });
});

/** A provider that answers with another price and a 15-minute meeting, and keeps the request it got. */
class OffPriceProvider implements AiProvider {
  readonly name = "claude";
  requests: ObjectRequest<unknown>[] = [];

  streamText(): AsyncIterable<string> {
    throw new Error("processCall streams nothing");
  }

  generateText(): Promise<string> {
    return Promise.reject(new Error("processCall asks for an object"));
  }

  generateObject<T>(request: ObjectRequest<T>): Promise<T> {
    this.requests.push(request);
    const answer: CallOutputs = {
      summary: "Rosa Lindqvist has 12 flats and wants full management.",
      numbers: [{ label: "Flats", value: "12" }],
      painPoints: ["Late rent"],
      crm: {
        company: "Lindqvist Homes",
        contactName: "Rosa Lindqvist",
        contactRole: "Owner",
        stage: "qualified",
        dealValue: "USD 999 per month",
        nextStep: "Send the proposal",
      },
      proposal: {
        title: "Management for Lindqvist Homes",
        scope: ["Rent collection"],
        price: "USD 999 per month",
        timeline: "Start in January",
        terms: "Valid for 30 days.",
      },
      followUpEmail: { subject: "Your proposal", body: "Hi Rosa" },
      nextMeeting: { title: "Next step", durationMinutes: 15, start: "2026-11-13T10:00:00", agenda: ["Questions"] },
    };
    return Promise.resolve(callOutputsSchema.parse(answer) as T);
  }
}

const pastedCall = [
  "[00:00] Mara Quist: Thanks for joining, Rosa. Tell me about your flats and how you run them today.",
  "[00:09] Rosa Lindqvist: We have 12 flats and I spend about 40 hours a month on tenants and repairs.",
].join("\n");

// U10. The test profile charges GBP 29 per flat per month and books 45-minute meetings.
describe("processCall with a provider that ignores the profile @meetings.live-paste", () => {
  it("enforces the profile's price and meeting length", async () => {
    const outputs = await processCall({ transcript: pastedCall, profile: testProfile, localNow }, { ai: new OffPriceProvider() });
    expect(outputs.proposal.price).toBe("GBP 29 per flat per month");
    expect(outputs.nextMeeting.durationMinutes).toBe(45);
  });

  it("asks the analysis model with a system prompt in the profile's name", async () => {
    const ai = new OffPriceProvider();
    await processCall({ transcript: pastedCall, profile: testProfile, localNow }, { ai });
    expect(ai.requests).toHaveLength(1);
    expect(ai.requests[0]?.role).toBe("analysis");
    expect(ai.requests[0]?.system).toContain("Harbourline Lettings");
  });
});
