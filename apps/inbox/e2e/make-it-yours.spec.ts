import { encodeProfile } from "@diepen/voice/profile-codec";
import { defaultPresetFor, presets } from "@diepen/voice/presets";
import { expect, test } from "@playwright/test";
import { testProfile } from "./fixtures/test-profile";
import { endCard, filmLane } from "./support/film-page";
import { escapeRegExp, gotoApp } from "./support/layout";
import { liveOwnerView, openChannel, openLive, sendMessage, showLivePart } from "./support/live-page";
import { brandColour, openMakeItYours, pickPreset } from "./support/make-it-yours";

test.describe.configure({ timeout: 90_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

const preset = defaultPresetFor("inbox");
const propertyManager = presets["brickfern-property"];

test("F11: picking the property manager preset rebrands the film @inbox.make-it-yours", async ({ page }) => {
  await gotoApp(page, "/?t=66000");
  expect(await brandColour(page)).toBe(preset.colors.brand);

  await pickPreset(page, propertyManager.name);

  await expect(filmLane(page, "owner")).toContainText(propertyManager.name);
  await expect(filmLane(page, "ai")).toHaveAttribute(
    "aria-label",
    new RegExp(`^${escapeRegExp(propertyManager.people.assistantName)}`),
  );
  await expect.poll(() => brandColour(page)).toBe(propertyManager.colors.brand);
});

test("F11: picking the property manager preset makes live replies name that company @inbox.make-it-yours", async ({ page }) => {
  await openLive(page);
  await pickPreset(page, propertyManager.name);

  await openChannel(page, "Website chat");
  const body = await sendMessage(page, "Hello");

  expect(body.reply.reply).toContain(propertyManager.name);
  await expect(page.getByText(body.reply.reply).filter({ visible: true }).first()).toBeVisible();
});

test("F12: a ?brand= profile of the visitor's own company changes the end card note @inbox.make-it-yours", async ({ page }) => {
  await gotoApp(page, `/?t=80000&brand=${encodeProfile(testProfile)}`);

  await expect(endCard(page)).toContainText(`${testProfile.name}'s brand`);
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
  await gotoApp(page, "/?t=66000");

  const panel = await openMakeItYours(page);
  await panel.getByLabel("Your website").fill("https://example.com");
  await panel.getByRole("button", { name: "Read my site" }).click();
  // "Opening example.com" is a status too, so wait for the draft itself before applying it.
  await expect(panel.getByRole("status").filter({ hasText: "Draft ready from example.com" })).toBeVisible({ timeout: 20_000 });
  await panel.getByRole("button", { name: "Apply" }).click();
  await expect(panel).toBeHidden();

  // The mock provider drafts the profile from the domain name only.
  await expect(filmLane(page, "owner")).toContainText("Example");
  expect(offSite).toEqual([]);
});
