import { expect, test } from "@playwright/test";

test("the app answers its health check", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
});
