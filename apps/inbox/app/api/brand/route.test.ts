import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/brand", () => {
  it("F13: drafts a profile from the fixture page under the mock provider, with no request leaving the server", async () => {
    const network = vi.fn(() => Promise.reject(new Error("The test made a network request")));
    vi.stubGlobal("fetch", network);

    const response = await POST(
      new Request("http://localhost/api/brand", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ provider: "mock", profile: { name: "Example", fictional: false } });
    expect(network).not.toHaveBeenCalled();
  });
});
