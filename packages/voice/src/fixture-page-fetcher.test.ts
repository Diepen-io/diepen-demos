import { afterEach, describe, expect, it, vi } from "vitest";
import { fixturePageFetcher, pageFetcherFor } from "./fixture-page-fetcher.ts";
import { fetchPage } from "./page-fetcher.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pageFetcherFor", () => {
  it("reads a fixture page under the mock provider, without the network", async () => {
    const network = vi.fn(() => Promise.reject(new Error("The test made a network request")));
    vi.stubGlobal("fetch", network);

    const page = await pageFetcherFor("mock")("https://www.example.com/about");

    expect(page.html).toContain("<title>example.com</title>");
    expect(network).not.toHaveBeenCalled();
  });

  it("reads the real page with Claude", () => {
    expect(pageFetcherFor("claude")).toBe(fetchPage);
    expect(pageFetcherFor("mock")).toBe(fixturePageFetcher);
  });
});
