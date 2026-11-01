import { liveSessionSchema } from "@/domain/live-session";
import { completeSession, dayMs, filmSession, storyMs } from "@/test-support/live-sessions";
import { presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { runChase } from "./container";

const profile = presets["ledgerwick-accounting"];
const filmOutstanding = ["bank-interest", "home-office", "health-insurance"];

type Sent = Awaited<ReturnType<typeof runChase>>["sent"][number];
const itemIds = (sent: Sent | undefined) => sent?.outstanding.map((entry) => entry.itemId);

describe("runChase with the in-process scheduler @documents.chase", () => {
  it("sends the follow-up, then the reminder, then the escalation, then nothing", async () => {
    const start = filmSession();

    const submitted = await runChase(start, profile, "submitted");
    expect(submitted.sent).toHaveLength(1);
    const followUp = submitted.sent[0];
    expect(followUp).toMatchObject({ kind: "follow-up", to: "client" });
    expect(followUp?.subject).toContain("3 documents");
    expect(itemIds(followUp)).toEqual(filmOutstanding);
    expect(storyMs(followUp?.sentAt ?? "")).toBe(storyMs(start.now));
    expect(liveSessionSchema.parse(submitted.session).submittedAt).toBeDefined();

    const firstSkip = await runChase(submitted.session, profile, "skip-days");
    expect(firstSkip.sent).toHaveLength(1);
    const reminder = firstSkip.sent[0];
    expect(reminder).toMatchObject({ kind: "reminder", to: "client" });
    expect(itemIds(reminder)).toEqual(filmOutstanding);
    expect(storyMs(reminder?.sentAt ?? "") - storyMs(followUp?.sentAt ?? "")).toBe(3 * dayMs);

    const secondSkip = await runChase(firstSkip.session, profile, "skip-days");
    expect(secondSkip.sent).toHaveLength(1);
    expect(secondSkip.sent[0]).toMatchObject({ kind: "escalation", to: "firm" });
    expect(secondSkip.session.escalated).toBe(true);

    const thirdSkip = await runChase(secondSkip.session, profile, "skip-days");
    expect(thirdSkip.sent).toEqual([]);
  });

  it("sends the follow-up on a skip when the client never pressed Done for now", async () => {
    const skipped = await runChase(filmSession(), profile, "skip-days");
    expect(skipped.sent.map((sent) => sent.kind)).toEqual(["follow-up"]);
    expect(itemIds(skipped.sent[0])).toEqual(filmOutstanding);
  });

  it("lists the items outstanding at send time", async () => {
    const submitted = await runChase(filmSession(), profile, "submitted");
    const healthChecked = {
      ...submitted.session,
      items: submitted.session.items.map((item) =>
        item.id === "health-insurance" ? { ...item, state: "checked" as const, detectedYear: 2025 } : item,
      ),
    };
    const skipped = await runChase(healthChecked, profile, "skip-days");
    expect(itemIds(skipped.sent[0])).toEqual(["bank-interest", "home-office"]);
  });

  it("sends nothing and leaves no job for a complete request", async () => {
    const done = await runChase(completeSession(), profile, "submitted");
    expect(done.sent).toEqual([]);
    expect(done.session.jobs).toEqual([]);
  });
});
