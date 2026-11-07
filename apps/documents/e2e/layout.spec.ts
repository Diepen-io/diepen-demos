import { expect, test } from "./support/documents-test";
import { openFilm, stepMoments } from "./support/film-page";
import { expectNoHorizontalOverflow, insideViewport, lane, laneTabs, type LaneId } from "./support/lanes";
import { action, openLetter, openLive, openRequestEmail, uploadRow } from "./support/live-page";

const lanes: LaneId[] = ["firm", "client", "system", "drive"];

test("nothing overflows 375 px in the film or in live mode @documents.film @documents.upload", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Runs once, at the phone width of the plan");
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 375, height: 812 });

  for (const t of stepMoments) {
    await openFilm(page, `?t=${t}`);
    await expectNoHorizontalOverflow(page, 375);
  }

  await openLive(page);
  await expectNoHorizontalOverflow(page, 375);
  const client = await openRequestEmail(page);
  await expectNoHorizontalOverflow(page, 375);
  await action(client, "Upload and sign").click();
  await expect(uploadRow(page, "payslip-summary")).toBeVisible();
  await expectNoHorizontalOverflow(page, 375);
  await openLetter(page);
  await expectNoHorizontalOverflow(page, 375);

  const tabs = laneTabs(page).getByRole("tab");
  await expect(tabs).toHaveText(["Firm", "Client", "System", "Drive"]);
  for (let index = 0; index < 4; index++) {
    await tabs.nth(index).click();
    await expectNoHorizontalOverflow(page, 375);
  }
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
]) {
  test(`the film finale and all four live lanes fit ${viewport.width}x${viewport.height} @documents.film @documents.upload`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Runs once, at the desktop sizes of the plan");
    await page.setViewportSize(viewport);

    // The finale is the tallest step: the numbers, "Try it yourself" and the note.
    await openFilm(page, `?t=${stepMoments[4]}`);
    const finale = page.locator("[data-keynote-finale]");
    await expect(finale).toBeVisible();
    expect(await insideViewport(page, finale), "film finale").toBe(true);

    await openLive(page);
    for (const id of lanes) {
      await expect(lane(page, id)).toBeVisible();
      expect(await insideViewport(page, lane(page, id)), `live lane ${id}`).toBe(true);
    }
  });
}
