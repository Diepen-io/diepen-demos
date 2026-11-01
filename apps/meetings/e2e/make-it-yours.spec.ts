import { encodeProfile } from "@diepen/voice/profile-codec";
import { testProfile } from "@/test-support/test-profile";
import { lane } from "./support/film";
import { expectAllOutputs, inputTab, output, transcriptBox, turnIntoProposal } from "./support/live";
import { expect, test } from "./support/test";

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

test("plays the film in the visitor's name and price @meetings.make-it-yours", async ({ page }) => {
  await page.goto(`/?brand=${brand}&t=63000`);
  await expect(lane(page, "proposal")).toContainText(`${testProfile.name} takes over on 1 January 2027`);
  await expect(lane(page, "proposal")).toContainText(`Your proposal from ${testProfile.name}`);
  await expect(lane(page, "crm")).toContainText(price);
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
