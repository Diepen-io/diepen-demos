import { expect, test } from "@playwright/test";
import { liveOwnerView, openChannel, openLive, ownerRow, replyAfter, sendMessage, showLivePart } from "./support/live-page";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

test("F8: a visitor books an offered slot and sees it in the calendar and the owner view @inbox.live-booking", async ({ page }) => {
  await openLive(page);
  await openChannel(page, "Website chat");

  const offer = await sendMessage(page, "Can I book an appointment?");
  expect(offer.reply.status).toBe("booking_offered");
  // With the visitor's clock at Tuesday 21:42 the first free slots are on Wednesday afternoon.
  expect(offer.reply.offeredSlots).toEqual(["2026-11-11T12:30", "2026-11-11T13:00"]);

  const chips = page.getByRole("list", { name: "Offered times" }).filter({ visible: true }).getByRole("button");
  await expect(chips).toHaveCount(2);
  const booking = await replyAfter(page, () => chips.first().click());

  expect(booking.reply.status).toBe("booked");
  expect(booking.reply.bookedSlot).toBe("2026-11-11T12:30");
  expect(booking.reply.reply).toContain("12:30");
  await expect(page.getByText(booking.reply.reply).filter({ visible: true }).first()).toBeVisible();

  await showLivePart(page, "Calendar");
  const block = page.getByTestId("calendar-booking");
  await expect(block).toHaveCount(1);
  await expect(block).toBeVisible();
  await expect(block).toContainText("You");

  await showLivePart(page, "Owner view");
  await expect(ownerRow(liveOwnerView(page), "chat").getByTestId("status-chip")).toHaveText("Booked");
});
