import type { Locator, Page } from "@playwright/test";
import { expect } from "./documents-test";
import { defaultFirm, escapeRegExp, lane, showLane, type Firm } from "./lanes";
import { itemLabels, menuLabelFor, type ItemId, type Sample } from "./samples";

/**
 * Drives `/live` as Daniel Okafor. The client lane holds the inbox, the email, the upload page
 * (one list item per checklist item) and the engagement letter.
 */

export const requestSubject = "Your 2025 tax return: 6 documents";

export type FileInput = string | { name: string; mimeType: string; buffer: Buffer };

export async function openLive(page: Page, query = ""): Promise<void> {
  await page.goto(`/live${query}`);
  await showLane(page, "client");
}

/** A button, or a link styled as one, by its name. */
export function action(scope: Locator, name: string | RegExp): Locator {
  return scope.getByRole("button", { name }).or(scope.getByRole("link", { name })).first();
}

export async function openRequestEmail(page: Page): Promise<Locator> {
  const client = await showLane(page, "client");
  await client.getByText(requestSubject).first().click();
  return client;
}

export async function openUploadPage(page: Page, query = ""): Promise<Locator> {
  await openLive(page, query);
  const client = await openRequestEmail(page);
  await action(client, "Upload and sign").click();
  await expect(uploadRow(page, "payslip-summary")).toBeVisible();
  return client;
}

/** One row of the upload page. */
export function uploadRow(page: Page, itemId: ItemId): Locator {
  return lane(page, "client").getByRole("listitem").filter({ hasText: itemLabels[itemId] });
}

/** One row of the firm's checklist. */
export function firmRow(page: Page, itemId: ItemId, firm: Firm = defaultFirm): Locator {
  return lane(page, "firm", firm).getByRole("listitem").filter({ hasText: itemLabels[itemId] });
}

export async function expectUploadState(page: Page, itemId: ItemId, state: "Checked" | "Problem found" | "Received" | "Missing") {
  await showLane(page, "client");
  await expect(uploadRow(page, itemId).getByText(state, { exact: true })).toBeVisible();
}

export async function expectFirmState(page: Page, itemId: ItemId, state: "Checked" | "Problem found" | "Received" | "Missing") {
  await showLane(page, "firm");
  await expect(firmRow(page, itemId).getByText(state, { exact: true })).toBeVisible();
}

/** "Use a sample" on the item's row, then the sample's menu entry. */
export async function useSample(page: Page, sample: Sample): Promise<void> {
  await showLane(page, "client");
  const row = uploadRow(page, sample.itemId);
  await row.getByRole("button", { name: /^Use a sample/ }).click();
  await page.getByRole("menuitem", { name: await menuLabelFor(sample.fileName), exact: true }).click();
}

/** Picks a file through the row's file chooser: "Upload" on a fresh item, "Upload again" after a problem. */
export async function uploadFile(page: Page, itemId: ItemId, file: FileInput, again = false): Promise<void> {
  await showLane(page, "client");
  const chooser = page.waitForEvent("filechooser");
  const name = again ? /^Upload again/ : /^Upload(?! again| and)/;
  await uploadRow(page, itemId).getByRole("button", { name }).click();
  await (await chooser).setFiles(file);
}

export function driveFolder(page: Page, folder: string): Locator {
  return lane(page, "drive").getByRole("treeitem").filter({ hasText: new RegExp(`^\\s*${escapeRegExp(folder)}`) });
}

/** A long name may be cut in the middle on a phone; the full name then stays in the title. */
export async function expectDriveFile(page: Page, folder: string, fileName: string): Promise<void> {
  await showLane(page, "drive");
  const entry = driveFolder(page, folder);
  await expect(entry.getByText(fileName, { exact: true }).or(entry.getByTitle(fileName, { exact: true })).first()).toBeVisible();
}

export async function openLetter(page: Page): Promise<Locator> {
  const client = await showLane(page, "client");
  await uploadRow(page, "engagement-letter").getByRole("button", { name: /^Review and sign/ }).click();
  await expect(client.getByLabel("Sign here")).toBeVisible();
  return client;
}

export function signButton(client: Locator): Locator {
  return client.getByRole("button", { name: "Sign", exact: true });
}

export async function signByTypedName(page: Page): Promise<void> {
  const client = await openLetter(page);
  await client.getByRole("button", { name: "Type your name instead" }).click();
  await client.getByRole("textbox", { name: /name/i }).fill("Daniel Okafor");
  await signButton(client).click();
  await expectFirmState(page, "engagement-letter", "Checked");
}

/** Opens an email in the client lane's inbox by its subject and returns the open message. */
export async function openEmail(page: Page, subject: string | RegExp): Promise<Locator> {
  const client = await showLane(page, "client");
  await client.getByText(subject).first().click();
  const message = client.getByRole("article").last();
  await expect(message).toBeVisible();
  return message;
}

/** Records every request to the app's own API, so a test can prove that none went out. */
export function recordApiRequests(page: Page, path?: string): string[] {
  const seen: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith(path ?? "/api/")) seen.push(`${request.method()} ${pathname}`);
  });
  return seen;
}
