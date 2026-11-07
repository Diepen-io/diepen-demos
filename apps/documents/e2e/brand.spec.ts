import { presets } from "@diepen/voice/presets";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { expect, test } from "./support/documents-test";
import { openFilm, stepMoments } from "./support/film-page";
import { showLane, type Firm } from "./support/lanes";
import { action, openLive, openRequestEmail, uploadRow, useSample } from "./support/live-page";
import { samples } from "./support/samples";

const brickfern = presets["brickfern-property"];
const firm: Firm = { name: brickfern.name };
const brandQuery = `?brand=${encodeProfile(brickfern)}`;

test("live mode speaks in the applied profile's name, colours and Drive @documents.brand", async ({ page }) => {
  await openLive(page, brandQuery);
  const client = await showLane(page, "client", firm);
  await expect(client.getByText(brickfern.people.assistantName).first()).toBeVisible();

  await openRequestEmail(page);
  await action(client, "Upload and sign").click();
  await expect(uploadRow(page, "payslip-summary")).toBeVisible();
  await expect(client).toContainText(brickfern.name);
  await expect(client).toContainText("brickfern-property.example");
  await expect(action(client, "Done for now")).toHaveCSS("background-color", "rgb(154, 52, 18)");

  const drive = await showLane(page, "drive", firm);
  const path = drive.getByRole("navigation", { name: "Folder path" });
  for (const part of ["My Drive", brickfern.name, "Clients", "Okafor, Daniel", "2025 Tax return"]) {
    await expect(path).toContainText(part);
  }

  const check = page.waitForRequest((request) => new URL(request.url()).pathname === "/api/check");
  await useSample(page, samples.payslip);
  const sentBody = (await check).postDataBuffer()?.toString("utf8") ?? "";
  expect(sentBody).toContain('name="profile"');
  expect(sentBody).toContain(brickfern.name);
});

test("the film keeps its own fictional firm with a ?brand= link (decision F1) @documents.brand", async ({ page }) => {
  const film = presets["ledgerwick-accounting"];
  await openFilm(page, `${brandQuery}&t=${stepMoments[3]}`);
  await expect(page.getByText(`${film.name} · Email`)).toBeVisible();
  await expect(page.getByText(brickfern.name)).toHaveCount(0);
});

test("a profile stored from an earlier visit writes the request email on a fresh load @documents.brand", async ({ page }) => {
  const stored = encodeProfile(brickfern);
  await page.addInitScript((value) => window.localStorage.setItem("diepen-demos:brand", value), stored);
  await openLive(page);
  const client = await showLane(page, "client", firm);
  await expect(client.getByText(brickfern.people.assistantName).first()).toBeVisible();
  await openRequestEmail(page);
  await expect(client).toContainText(`${brickfern.name} needs these 6 documents`);
  await expect(client).toContainText(brickfern.voice.signOff.split("\n")[1] ?? "");
});
