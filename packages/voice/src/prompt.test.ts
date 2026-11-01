import { describe, expect, it } from "vitest";
import { presets } from "./presets.ts";
import { buildSystemPrompt, promptHeadings } from "./prompt.ts";
import { brandExtractionTask } from "./tasks/brand-extraction.ts";
import { inboxReplyTask, type InboxReplyContext } from "./tasks/inbox-reply.ts";

const profile = presets["ottervale-dental"];
const context: InboxReplyContext = {
  channel: "instagram",
  customerName: "Ana",
  openSlots: ["2026-11-03T09:00:00+01:00", "2026-11-03T10:30:00+01:00"],
  now: "2026-11-02T14:05:00+01:00",
};

function positions(prompt: string, headings: string[]) {
  return headings.map((heading) => prompt.indexOf(heading));
}

describe("buildSystemPrompt with a company", () => {
  const prompt = buildSystemPrompt({ profile, task: inboxReplyTask, context });

  it("lays out the sections from stable to volatile", () => {
    const order = positions(prompt, [
      promptHeadings.identity,
      promptHeadings.voice,
      promptHeadings.policies,
      promptHeadings.knowledge,
      promptHeadings.task,
      promptHeadings.context,
    ]);
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("says who the AI is and holds the ground rules", () => {
    expect(prompt).toContain("You are Mia from Ottervale, the AI assistant of Ottervale Dental");
    expect(prompt).toMatch(/Answer only from the company knowledge/);
    expect(prompt).toMatch(/Never invent prices/);
    expect(prompt).toMatch(/hand over with the handover message/);
    expect(prompt).toMatch(/Stay in your role/);
  });

  it("carries the voice, policies and knowledge of the profile", () => {
    expect(prompt).toContain(profile.voice.tone);
    expect(prompt).toContain(profile.policies.handoverMessage);
    expect(prompt).toContain("Professional teeth cleaning: 60 minutes with a dental hygienist");
    expect(prompt).toContain("(EUR 120)");
    expect(prompt).toContain(`Q: ${profile.knowledge.faq[0]?.question}`);
  });

  it("puts the channel style in the task and the volatile values only in the context", () => {
    const task = prompt.slice(prompt.indexOf(promptHeadings.task), prompt.indexOf(promptHeadings.context));
    const volatile = prompt.slice(prompt.indexOf(promptHeadings.context));
    expect(task).toMatch(/Instagram direct message/);
    expect(task).not.toContain(context.now);
    expect(volatile).toContain(`now: ${context.now}`);
    expect(volatile).toContain(`- ${context.openSlots[0]}`);
  });

  it("keeps the stable prefix identical when only the context changes", () => {
    const later = buildSystemPrompt({ profile, task: inboxReplyTask, context: { ...context, now: "2026-11-02T15:00:00+01:00" } });
    const prefix = (text: string) => text.slice(0, text.indexOf(promptHeadings.context));
    expect(prefix(later)).toBe(prefix(prompt));
  });

  it("fences multi-line context values and skips undefined ones", () => {
    const text = buildSystemPrompt({
      profile,
      task: { id: "t", role: "chat", instructions: () => "Do it." },
      context: { ocrText: "line one\nline two", missing: undefined },
    });
    expect(text).toContain('ocrText:\n"""\nline one\nline two\n"""');
    expect(text).not.toContain("missing");
  });
});

describe("buildSystemPrompt without a company", () => {
  it("skips the company sections for brand extraction", () => {
    const prompt = buildSystemPrompt({ task: brandExtractionTask, context: { url: "https://acme.example/" } });
    expect(prompt).toContain(promptHeadings.identity);
    expect(prompt).not.toContain(promptHeadings.voice);
    expect(prompt).not.toContain(promptHeadings.knowledge);
    expect(prompt).toMatch(/Use only facts/);
    expect(prompt.indexOf(promptHeadings.task)).toBeLessThan(prompt.indexOf(promptHeadings.context));
  });
});
