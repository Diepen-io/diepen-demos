import { presets } from "@diepen/voice/presets";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { testProfile } from "@/test-support/test-profile";
import { beatMs, keynoteStep } from "./support/film";
import { expectAllOutputs, inputTab, output, transcriptBox, turnIntoProposal } from "./support/live";
import { expect, test } from "./support/test";

// A flow waits for a dev compile, then up to 30 s per output (`outputTimeout`) and the 700 ms reveal steps; a loaded machine needs the margin.
test.describe.configure({ timeout: 90_000 });

const brand = encodeProfile(testProfile);
const price = "GBP 29 per flat per month";

// F14
test("runs live mode in the visitor's brand, owner and price @meetings.make-it-yours", async ({ page }) => {
  await page.goto(`/live?brand=${brand}`);
  await expect(page.getByRole("banner")).toContainText(testProfile.name);

  await inputTab(page, "Sample call").click();
  await expect(transcriptBox(page)).toHaveValue(/Mara Quist:/);
  await turnIntoProposal(page).click();
  await expectAllOutputs(page);
  await expect(output(page, "proposal")).toContainText(price);
});

test("plays the film in its own fictional company, even with a ?brand= link (decision F1) @meetings.make-it-yours", async ({ page }) => {
  const film = presets["brickfern-property"];
  await page.goto(`/?brand=${brand}&t=${2 * beatMs}`);
  await expect(keynoteStep(page)).toContainText(film.name);
  await expect(keynoteStep(page)).not.toContainText(testProfile.name);
  await expect(keynoteStep(page)).not.toContainText(price);
});

// F15
test("applies a profile read from a website and sets the brand colour @meetings.make-it-yours", async ({ page }) => {
  await page.route("**/api/brand", (route) => route.fulfill({ json: { profile: testProfile, provider: "mock" } }));
  await page.goto("/live");
  await page.getByRole("button", { name: "Make it yours" }).first().click();
  await page.getByLabel("Your website").fill("harbourline.example");
  await page.getByRole("button", { name: "Read my site" }).click();
  await expect(page.getByText("Draft ready from harbourline.example", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByRole("banner")).toContainText(testProfile.name);
  const brandColour = await page
    .locator("[data-brand-scope]")
    .first()
    .evaluate((element) => getComputedStyle(element).getPropertyValue("--brand").trim());
  expect(brandColour).toBe(testProfile.colors.brand);
});
