import { MockProvider } from "@diepen/ai/mock-provider";
import { describe, expect, it } from "vitest";
import { defaultPresetFor } from "../presets.ts";
import { promptHeadings } from "../prompt.ts";
import { buildCallOutputsRequest, callOutputsSchema, type CallOutputs } from "./call-outputs.ts";

const fixture: CallOutputs = {
  summary: "A landlord with 12 flats wants full management.",
  numbers: [{ label: "Units", value: "12" }],
  painPoints: ["Late rent"],
  crm: {
    company: "Kranich Holdings",
    contactName: "Eva Kranich",
    contactRole: "Owner",
    stage: "qualified",
    dealValue: "EUR 408 per month",
    nextStep: "Send proposal",
  },
  proposal: {
    title: "Full rental management for 12 units",
    scope: ["Rent collection"],
    price: "12 units x EUR 34 per month = EUR 408 per month",
    timeline: "Takeover within four weeks",
    terms: "Three months' notice after 12 months",
  },
  followUpEmail: { subject: "Your proposal", body: "Hello Eva" },
  nextMeeting: { title: "Proposal review", durationMinutes: 30, start: "2026-11-03T10:00:00+01:00", agenda: ["Proposal"] },
};

describe("buildCallOutputsRequest", () => {
  const request = buildCallOutputsRequest({
    profile: defaultPresetFor("meetings"),
    transcript: "Eva: We have 12 flats.",
    localNow: "2026-11-02T16:20:00+01:00",
    mock: () => fixture,
  });

  it("asks the analysis model, with localNow in the context and the transcript as the message", () => {
    expect(request.role).toBe("analysis");
    expect(request.system.slice(request.system.indexOf(promptHeadings.context))).toContain("localNow: 2026-11-02T16:20:00+01:00");
    expect(request.system).toContain("Full rental management");
    expect(request.messages).toEqual([{ role: "user", content: "Call transcript:\nEva: We have 12 flats." }]);
  });

  it("returns the app's mock through the mock provider", async () => {
    await expect(new MockProvider().generateObject(request)).resolves.toEqual(fixture);
    expect(callOutputsSchema.shape.crm.shape.dealValue.parse("EUR 408")).toBe("EUR 408");
  });
});
