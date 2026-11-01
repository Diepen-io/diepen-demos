import { createGuards } from "@diepen/ai/guards";
import { MockProvider } from "@diepen/ai/mock-provider";
import { describe, expect, it, vi } from "vitest";
import { createBrandHandler } from "./brand-route.ts";
import { PageFetchError, type PageFetcher } from "./page-fetcher.ts";
import { companyProfileSchema } from "./profile.ts";

const html = `<title>Harbour Yoga</title><meta name="theme-color" content="#0e7490">`;

function post(body: unknown) {
  return new Request("https://demo.example/api/brand", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
    body: JSON.stringify(body),
  });
}

function handler(fetchPage: PageFetcher, perMinute = 10) {
  return createBrandHandler({
    fetchPage,
    provider: new MockProvider(),
    guards: createGuards({ perMinute, dailyCap: 100 }),
  });
}

describe("handleBrandRequest", () => {
  it("returns a valid profile and the provider name", async () => {
    const fetchPage = vi.fn<PageFetcher>((url) => Promise.resolve({ url, html }));
    const response = await handler(fetchPage)(post({ url: "harbour-yoga.example" }));

    expect(response.status).toBe(200);
    expect(fetchPage).toHaveBeenCalledWith("https://harbour-yoga.example");
    const body = (await response.json()) as { profile: unknown; provider: string };
    expect(body.provider).toBe("mock");
    expect(companyProfileSchema.parse(body.profile)).toMatchObject({ name: "Harbour Yoga", fictional: false });
  });

  it("rejects a body without a usable URL", async () => {
    const fetchPage = vi.fn<PageFetcher>();
    const run = handler(fetchPage);
    expect((await run(post({}))).status).toBe(400);
    expect((await run(post({ url: "ftp://acme.example" }))).status).toBe(400);
    expect((await run(new Request("https://demo.example", { method: "POST", body: "{" }))).status).toBe(400);
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it("answers 422 with a plain message when the page cannot be fetched", async () => {
    const response = await handler(() => Promise.reject(new PageFetchError("That address is not a public website.")))(
      post({ url: "https://intranet.example" }),
    );
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({ error: "That address is not a public website." });
  });

  it("falls back to the film when a guard trips", async () => {
    const run = handler((url) => Promise.resolve({ url, html }), 1);
    await run(post({ url: "harbour-yoga.example" }));
    const response = await run(post({ url: "harbour-yoga.example" }));
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({ fallback: "film", reason: "rate_limit" });
  });
});
