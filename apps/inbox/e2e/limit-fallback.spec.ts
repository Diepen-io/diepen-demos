import { expect, test } from "@playwright/test";
import { keynoteFilm } from "./support/film-page";
import { openChannel, openLive } from "./support/live-page";

test.describe.configure({ timeout: 60_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

test("F10: a tripped cost guard sends the visitor to the film with a short note @inbox.limit-fallback", async ({ page }) => {
  await page.route("**/api/reply", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        fallback: "film",
        reason: "daily_cap",
        message: "The live demo is busy today. Here is the recorded film.",
      }),
    }),
  );
  await openLive(page);

  await openChannel(page, "Website chat");
  await page.getByRole("textbox", { name: "Message" }).fill("Can I book a time this week?");
  await page.getByRole("button", { name: "Send", exact: true }).click();

  await page.waitForURL((url) => url.pathname === "/" && url.searchParams.get("fallback") === "limit");
  await expect(
    page.getByRole("status").filter({ hasText: "Live answers are paused for now. Here is the film." }),
  ).toBeVisible();
  await expect(keynoteFilm(page)).toBeVisible();
});
