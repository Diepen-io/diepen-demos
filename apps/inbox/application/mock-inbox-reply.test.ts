import type { CompanyProfile } from "@diepen/voice/profile";
import { defaultPresetFor } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { freeSlots } from "@/domain/calendar";
import type { Channel } from "@/domain/channel";
import { mockInboxReply } from "./mock-inbox-reply";

const preset = defaultPresetFor("inbox");
const now = "2026-11-10T21:42";

/** What "Make it yours" gives for a website that lists no services, prices or hours. */
const bareProfile: CompanyProfile = {
  ...preset,
  name: "Hargreaves and Sons Chartered Accountants and Tax Advisers",
  people: { owner: { name: "the team", role: "Owners" }, assistantName: "Sam" },
  policies: { ...preset.policies, handoverWhen: ["A complaint", "A refund request"], handoverMessage: "Thank you. The team will reply here." },
  knowledge: { ...preset.knowledge, services: [], openingHours: "Not listed on the website.", faq: [] },
};

type ReplyOptions = { profile?: CompanyProfile; channel?: Channel; offeredSlots?: string[] };

function replyTo(text: string, { profile = preset, channel = "chat", offeredSlots = [] }: ReplyOptions = {}) {
  const inquiry = { channel, profile, messages: [{ role: "customer" as const, text }], bookings: [], offeredSlots, now };
  return mockInboxReply(inquiry, freeSlots(now, [], profile.knowledge.bookingMinutes));
}

describe("mockInboxReply", () => {
  it("hands over a complaint that never says the word", () => {
    const reply = replyTo("I waited 40 minutes past my appointment time and nobody told me why. Not acceptable.");

    expect(reply.status).toBe("needs_human");
    expect(reply.offeredSlots).toBeUndefined();
    expect(reply.handoverReason).toBe("Raised a complaint");
  });

  it("adds the phone number to an urgent handover only, never to a refund", () => {
    const urgent = replyTo("My tooth hurts a lot since yesterday, the left side is swollen.");
    expect(urgent).toMatchObject({ status: "needs_human", handoverReason: "Described pain or an accident" });
    expect(urgent.reply).toContain(`please call us on ${preset.knowledge.phone ?? ""}`);

    const refund = replyTo("I'm not happy with how it went and I'd like a refund.");
    expect(refund.handoverReason).toBe("Asked for a refund");
    expect(refund.reply).not.toContain("call us on");
  });

  it("hands over a question the company knowledge does not answer, by the profile's rule", () => {
    const reply = replyTo("Do you treat dogs?");

    expect(reply.status).toBe("needs_human");
    expect(reply.handoverReason).toBe("Anything the company knowledge does not answer");
    expect(reply.reply).toBe(preset.policies.handoverMessage);
  });

  it("answers a question from the FAQ", () => {
    const reply = replyTo("Do you take new patients?");

    expect(reply.status).toBe("answered");
    expect(reply.reply).toContain(preset.knowledge.faq[0]?.answer ?? "missing FAQ");
  });

  it("offers two times on different days", () => {
    const reply = replyTo("Can I book an appointment?");

    expect(reply.offeredSlots).toEqual(["2026-11-11T12:30", "2026-11-12T09:00"]);
  });

  it("greets and signs off an email with the profile's sign-off", () => {
    const reply = replyTo("What are your opening hours?", { channel: "email" });

    expect(reply.reply).toMatch(/^Hi there,\n\n/);
    expect(reply.reply.endsWith(`\n\n${preset.voice.signOff}`)).toBe(true);
  });

  it("reads well for a profile with no services, prices or hours and an owner called the team", () => {
    const price = replyTo("What are your prices?", { profile: bareProfile });
    const hours = replyTo("When are you open?", { profile: bareProfile });
    const hello = replyTo("Hello", { profile: bareProfile });

    expect(price.reply).toBe("Prices depend on what you need, so the team gives you a personal quote. Would you like me to find you a time?");
    expect(hours.status).toBe("needs_human");
    expect(hours.reply).not.toContain("Not listed");
    expect(hello.reply).toContain(`Thanks for writing to ${bareProfile.name}.`);
    for (const reply of [price, hours, hello]) expect(reply.reply).not.toMatch(/ \?|\s{2}|\.\./);
  });
});
