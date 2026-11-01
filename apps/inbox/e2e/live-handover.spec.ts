import { defaultPresetFor } from "@diepen/voice/presets";
import { expect, test } from "@playwright/test";
import {
  isReplyRequest,
  liveOwnerView,
  openChannel,
  openLive,
  sendMessage,
  showLivePart,
} from "./support/live-page";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

const preset = defaultPresetFor("inbox");

test("F9: a refund request goes to a person, stops the AI and can start over @inbox.live-handover", async ({ page }) => {
  const channelsAsked: string[] = [];
  page.on("request", (request) => {
    if (!isReplyRequest(request)) return;
    const body = request.postDataJSON() as { channel?: string } | null;
    channelsAsked.push(body?.channel ?? "unknown");
  });
  await openLive(page);

  await openChannel(page, "Instagram");
  const handover = await sendMessage(page, "I'm not happy with how it went and I'd like a refund.");
  expect(handover.reply.status).toBe("needs_human");
  const handoverMessage = page.getByText(preset.policies.handoverMessage).filter({ visible: true });
  await expect(handoverMessage.first()).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message" }).filter({ visible: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start over" })).toBeVisible();

  // A newer conversation on another channel must not push the handover off the top.
  await openChannel(page, "Email");
  await sendMessage(page, "What are your opening hours?");
  await showLivePart(page, "Owner view");
  const firstRow = liveOwnerView(page).getByTestId("owner-row").first();
  await expect(firstRow).toHaveAttribute("data-channel", "instagram");
  await expect(firstRow.getByTestId("status-chip")).toHaveText("Needs a human");

  await openChannel(page, "Instagram");
  expect(channelsAsked.filter((channel) => channel === "instagram")).toHaveLength(1);

  await page.getByRole("button", { name: "Start over" }).click();
  await expect(handoverMessage).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Message" }).filter({ visible: true })).toBeVisible();
  expect(channelsAsked.filter((channel) => channel === "instagram")).toHaveLength(1);
});

test("F17: after a handover the times offered earlier can no longer be picked @inbox.live-handover", async ({ page }) => {
  await openLive(page);
  await openChannel(page, "Website chat");

  await sendMessage(page, "Can I book an appointment?");
  const chips = page.getByRole("list", { name: "Offered times" }).filter({ visible: true });
  await expect(chips.getByRole("button")).toHaveCount(2);

  await sendMessage(page, "I waited 40 minutes past my appointment time and nobody told me why. Not acceptable.");
  await expect(page.getByRole("button", { name: "Start over" })).toBeVisible();
  await expect(chips.getByRole("button")).toHaveCount(0);
  // The shared chips show the inactive look, not only the missing buttons.
  await expect(chips).toHaveAttribute("data-disabled", "true");
});
