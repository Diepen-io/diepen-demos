import { defineConfig, devices } from "@playwright/test";

// e2e owns its port and build folder, and always runs the mock provider, so it never calls Claude.
const port = 3203;
const external = process.env.VERIFY_URL;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: external ?? `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: external
    ? undefined
    : {
        command: `next dev --port ${port}`,
        url: `http://localhost:${port}/api/health`,
        reuseExistingServer: false,
        timeout: 120_000,
        env: { AI_PROVIDER: "mock", NEXT_DIST_DIR: ".next-e2e", NEXT_TELEMETRY_DISABLED: "1" },
      },
});
