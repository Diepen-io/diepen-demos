import { expect, test } from "@playwright/test";
import {
  clickFilmControl,
  filmPanel,
  playPauseButton,
  restartButton,
  speedButton,
  storyClock,
} from "./support/film-page";
import { gotoApp } from "./support/layout";

test.describe.configure({ timeout: 60_000 });
// A missing control fails in seconds instead of holding the whole test timeout.
test.use({ actionTimeout: 15_000 });

test("F3: Pause holds the clock, Play resumes it, Restart goes back to 21:42, speed cycles @inbox.film-controls", async ({ page }) => {
  // Starts just before the first race, so the clock moves within a second of playing.
  await gotoApp(page, "/?t=6000");
  const clock = storyClock(page);
  await clickFilmControl(page, playPauseButton(page, "Play"));
  await expect(clock).toHaveAccessibleName(/21:4[3-9]/, { timeout: 15_000 });

  await clickFilmControl(page, playPauseButton(page, "Pause"));
  const pausedAt = (await clock.getAttribute("aria-label")) ?? "";
  // The check is that one second of real time leaves the clock where it was.
  await page.waitForTimeout(1000);
  await expect(clock).toHaveAttribute("aria-label", pausedAt);

  await clickFilmControl(page, playPauseButton(page, "Play"));
  await expect(clock).not.toHaveAttribute("aria-label", pausedAt, { timeout: 10_000 });

  await clickFilmControl(page, restartButton(page));
  await expect(clock).toHaveAccessibleName(/21:42/);

  const speed = speedButton(page);
  await expect(speed).toHaveAccessibleName(/Speed 1 times/);
  for (const next of ["1.5", "2", "0.5", "1"]) {
    await clickFilmControl(page, speed);
    await expect(speed).toHaveAccessibleName(new RegExp(`Speed ${next.replace(".", "\\.")} times`));
  }
});

test("F4: ?t=38000 opens on Daniel's website chat at 00:33 @inbox.film-controls", async ({ page }) => {
  await gotoApp(page, "/?t=38000");

  await expect(filmPanel(page, "daniel")).toHaveAttribute("data-role", "focus");
  await expect(filmPanel(page, "daniel")).toHaveAttribute("aria-label", "Daniel Moore, Website chat");
  await expect(storyClock(page)).toHaveAccessibleName(/00:33/);
});
