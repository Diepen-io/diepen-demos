import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./support/layout";
import {
  liveChannels,
  liveOwnerView,
  openChannel,
  openLive,
  ownerRow,
  sendMessage,
  showLivePart,
  type LivePart,
} from "./support/live-page";
import { collectPageProblems } from "./support/page-problems";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

/**
 * The first sentence of a reply's answer: text that sits in one paragraph of the thread on every
 * channel. An email's greeting is a paragraph of its own, so the answer starts after it.
 */
function firstSentence(text: string): string {
  const [first = text, second] = text.split(/\n{2,}/);
  const answer = second !== undefined && first.endsWith(",") ? second : first;
  return answer.split(/(?<=[.!?])\s/)[0] ?? answer;
}

test("F6: every channel answers an opening hours question and the owner view shows it as Answered @inbox.live-chat", async ({ page }) => {
  await openLive(page);

  for (const channel of liveChannels) {
    await openChannel(page, channel.label);
    const body = await sendMessage(page, "What are your opening hours?");

    expect(body.reply.status).toBe("answered");
    await expect(page.getByText(firstSentence(body.reply.reply)).filter({ visible: true }).first()).toBeVisible();

    await showLivePart(page, "Owner view");
    await expect(ownerRow(liveOwnerView(page), channel.id)).toContainText("Answered");
  }
});

test("F7: the provider note says the answers are canned @inbox.live-chat", async ({ page }) => {
  await openLive(page);

  await expect(page.getByRole("note").filter({ hasText: /sample answers/i })).toBeVisible();
});

test("F14: /live fits a 375 px screen on every bottom tab and every channel tab @inbox.live-chat", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "A phone width check");
  await page.setViewportSize({ width: 375, height: 812 });
  await openLive(page);

  for (const part of ["Customer", "Owner view", "Calendar"] satisfies LivePart[]) {
    await showLivePart(page, part);
    await expectNoHorizontalOverflow(page, `/live, ${part}`);
  }
  for (const channel of liveChannels) {
    await openChannel(page, channel.label);
    await expectNoHorizontalOverflow(page, `/live, ${channel.label}`);
  }
});

test("F15: /live answers one message with no console errors and no failed requests @inbox.live-chat", async ({ page }) => {
  const problems = collectPageProblems(page);
  await openLive(page);

  await openChannel(page, "Website chat");
  const body = await sendMessage(page, "How much is a check-up?");
  await expect(page.getByText(firstSentence(body.reply.reply)).filter({ visible: true }).first()).toBeVisible();

  expect(problems).toEqual([]);
});

test("F18: a starter whose reply fails stays in the thread, and sending again replaces it @inbox.live-chat", async ({ page }) => {
  await openLive(page);
  await openChannel(page, "Website chat");
  await page.route("**/api/reply", (route) => route.fulfill({ status: 503, json: { fallback: "film", reason: "unavailable" } }));

  const starter = "Can I book a time this week?";
  await page.getByRole("button", { name: starter }).filter({ visible: true }).click();

  await expect(page.getByRole("alert").filter({ hasText: "No answer this time" })).toBeVisible();
  await expect(page.getByText(starter, { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(page.getByText("Not answered").filter({ visible: true })).toBeVisible();

  await page.unroute("**/api/reply");
  await sendMessage(page, starter);
  await expect(page.getByText(starter, { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(page.getByText("Not answered")).toHaveCount(0);
});
