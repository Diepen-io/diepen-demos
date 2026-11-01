import { afterEach, describe, expect, it, vi } from "vitest";
import { requestBrandProfile } from "./brand-request";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestBrandProfile", () => {
  it("shows the route's own message when the page cannot be read", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve(Response.json({ message: "That address is not a public website." }, { status: 422 })),
    );

    await expect(requestBrandProfile("https://intranet.example")).resolves.toEqual({
      ok: false,
      message: "That address is not a public website.",
    });
  });

  it("falls back to a general message when the error body has none", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("oops", { status: 500 })));

    const result = await requestBrandProfile("https://acme.example");

    expect(result).toMatchObject({ ok: false, message: expect.stringContaining("fill in the form") as unknown });
  });
});
