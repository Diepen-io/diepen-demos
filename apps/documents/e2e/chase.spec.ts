import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/documents-test";
import { lane, showLane } from "./support/lanes";
import { action, expectUploadState, openEmail, openUploadPage, signByTypedName, useSample } from "./support/live-page";
import { itemLabels, samples, type ItemId } from "./support/samples";

// Each test signs and checks five or six files through /api/check one after the other; on a loaded
// machine one check can take 10 s, so the test gets that per file plus the chase itself.
const chaseTimeout = 150_000;

const stillOpen: ItemId[] = ["bank-interest", "home-office", "health-insurance"];
const done: ItemId[] = ["engagement-letter", "payslip-summary", "donation-receipt"];

/** The film's first batch: letter signed, payslip and donation fine, bank and home office with a problem. */
async function sendFirstBatch(page: Page) {
  await openUploadPage(page);
  await signByTypedName(page);
  for (const [sample, state] of [
    [samples.payslip, "Checked"],
    [samples.bank2024, "Problem found"],
    [samples.donation, "Checked"],
    [samples.homeOfficeUnsigned, "Problem found"],
  ] as const) {
    await useSample(page, sample);
    await expectUploadState(page, sample.itemId, state);
  }
}

async function pressDoneForNow(page: Page) {
  const client = await showLane(page, "client");
  await action(client, "Done for now").click();
}

async function expectListsExactlyTheOpenItems(message: Locator) {
  for (const id of stillOpen) await expect(message).toContainText(itemLabels[id]);
  for (const id of done) await expect(message).not.toContainText(itemLabels[id]);
}

test("Done for now sends a follow-up that lists exactly the 3 open items @documents.chase", async ({ page }) => {
  test.setTimeout(chaseTimeout);
  await sendFirstBatch(page);
  await pressDoneForNow(page);

  const followUp = await openEmail(page, /3 documents still needed/);
  await expectListsExactlyTheOpenItems(followUp);
});

test("Skip 3 days sends the reminder, and a second skip escalates to the firm @documents.chase", async ({ page }) => {
  test.setTimeout(chaseTimeout);
  await sendFirstBatch(page);
  await pressDoneForNow(page);
  await openEmail(page, /3 documents still needed/);

  const skip = page.getByRole("group", { name: "Story controls" }).getByRole("button", { name: "Skip 3 days" });
  await skip.click();
  await expect(page.getByRole("timer")).toContainText(/Thu/);
  await expect(page.getByRole("timer")).toContainText(/12 Mar/);
  const reminder = await openEmail(page, /Reminder: 3 documents still open/);
  await expectListsExactlyTheOpenItems(reminder);

  await skip.click();
  await showLane(page, "firm");
  await expect(lane(page, "firm")).toContainText("Call Daniel Okafor");
  await expect(skip).toBeDisabled();
});

test("Done for now on a complete request sends no email and marks it ready @documents.chase", async ({ page }) => {
  test.setTimeout(chaseTimeout);
  await openUploadPage(page);
  await signByTypedName(page);
  for (const sample of [samples.payslip, samples.bank2025, samples.donation, samples.homeOfficeSigned, samples.healthInsurance]) {
    await useSample(page, sample);
    await expectUploadState(page, sample.itemId, "Checked");
  }

  const chase = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/chase");
  await pressDoneForNow(page);
  const body = (await (await chase).json()) as { sent: unknown[] };
  expect(body.sent).toEqual([]);

  await showLane(page, "firm");
  await expect(lane(page, "firm")).toContainText("Complete. Ready to prepare the return.");
  const client = await showLane(page, "client");
  await expect(client).not.toContainText("documents still needed");
});
