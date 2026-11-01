import { expect, test } from "@playwright/test";
import { filmLane } from "./support/film-page";
import { gotoApp } from "./support/layout";

test.describe.configure({ timeout: 60_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

test("F5: at 08:00 the owner view lists needs a human first, then by last activity @inbox.owner-view", async ({ page }) => {
  await gotoApp(page, "/?t=66000");

  const rows = filmLane(page, "owner").getByTestId("owner-row");
  await expect(rows).toHaveCount(4);
  const expected = [
    { channel: "chat", name: "Daniel Moore", status: "Needs a human" },
    { channel: "linkedin", name: "Tom Becker", status: "Booked" },
    { channel: "instagram", name: "Priya Shah", status: "Answered" },
    { channel: "email", name: "Ana Ruiz", status: "Booked" },
  ];
  for (const [index, { channel, name, status }] of expected.entries()) {
    const row = rows.nth(index);
    await expect(row).toHaveAttribute("data-channel", channel);
    await expect(row).toContainText(name);
    await expect(row.getByTestId("status-chip")).toHaveText(status);
  }
});
