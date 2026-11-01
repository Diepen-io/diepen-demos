import { encodeProfile } from "@diepen/voice/profile-codec";
import { defaultPresetFor, presets } from "@diepen/voice/presets";
import { expect, test } from "@playwright/test";
import { testProfile } from "./fixtures/test-profile";
import { keynoteFinale, stepMoment } from "./support/film-page";
import { gotoApp } from "./support/layout";
import { liveOwnerView, openChannel, openLive, sendMessage, showLivePart } from "./support/live-page";
import { brandColour, openMakeItYours, pickPreset } from "./support/make-it-yours";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

const preset = defaultPresetFor("inbox");
const propertyManager = presets["brickfern-property"];
const finaleAt = stepMoment(4);

test("F11: picking the property manager preset on the film opens live mode in that company @inbox.make-it-yours", async ({ page }) => {
  await gotoApp(page, `/?t=${finaleAt}`);
  expect(await brandColour(page)).toBe(preset.colors.brand);

  const panel = await openMakeItYours(page);
  await panel.getByRole("button").filter({ hasText: propertyManager.name }).click();

  await expect(page).toHaveURL(/\/live\?brand=brickfern-property$/);
  await expect(page.getByRole("banner")).toContainText(propertyManager.name);
  await expect.poll(() => brandColour(page)).toBe(propertyManager.colors.brand);
});

test("F11: the film keeps its own company when a saved profile exists (decision F1) @inbox.make-it-yours", async ({ page }) => {
  await gotoApp(page, `/?t=${finaleAt}&brand=${propertyManager.id}`);

  await expect(keynoteFinale(page)).toContainText(preset.name);
  await expect(page.getByRole("banner").first()).toContainText(preset.name);
  expect(await brandColour(page)).toBe(preset.colors.brand);
});

test("F11: picking the property manager preset makes live replies name that company @inbox.make-it-yours", async ({ page }) => {
  await openLive(page);
  await pickPreset(page, propertyManager.name);

  await openChannel(page, "Website chat");
  const body = await sendMessage(page, "Hello");

  expect(body.reply.reply).toContain(propertyManager.name);
  await expect(page.getByText(body.reply.reply).filter({ visible: true }).first()).toBeVisible();
});

test("F12: a ?brand= link to the film keeps the fictional finale and Try it live carries the profile to live mode @inbox.make-it-yours", async ({ page }) => {
  await gotoApp(page, `/?t=${finaleAt}&brand=${encodeProfile(testProfile)}`);

  await expect(keynoteFinale(page)).toContainText(preset.name);
  await expect(keynoteFinale(page).getByRole("link", { name: "Try it live" })).toHaveAttribute(
    "href",
    `/live?brand=${encodeProfile(testProfile)}`,
  );
});

test("F12: a ?brand= profile names the company in the live owner view and in a reply @inbox.make-it-yours", async ({ page }) => {
  await openLive(page, `/live?brand=${encodeProfile(testProfile)}`);

  await showLivePart(page, "Owner view");
  await expect(liveOwnerView(page)).toContainText(testProfile.name);

  await openChannel(page, "Website chat");
  const body = await sendMessage(page, "Hello");
  expect(body.reply.reply).toContain(testProfile.name);
  await expect(page.getByText(body.reply.reply).filter({ visible: true }).first()).toBeVisible();
});

test("F13: reading a website applies the drafted profile without the browser leaving the app @inbox.make-it-yours", async ({ page }) => {
  const offSite: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("example.com")) offSite.push(request.url());
  });
  await gotoApp(page, `/?t=${finaleAt}`);

  const panel = await openMakeItYours(page);
  await panel.getByLabel("Your website").fill("https://example.com");
  await panel.getByRole("button", { name: "Read my site" }).click();
  // "Opening example.com" is a status too, so wait for the draft itself before applying it.
  await expect(panel.getByRole("status").filter({ hasText: "Draft ready from example.com" })).toBeVisible({ timeout: 20_000 });
  await panel.getByRole("button", { name: "Apply" }).click();

  // Applying on the film opens live mode in the draft. The mock provider drafts it from the domain name only.
  await expect(page).toHaveURL(/\/live\?brand=/);
  await expect(page.getByRole("banner")).toContainText("Example");
  expect(offSite).toEqual([]);
});
