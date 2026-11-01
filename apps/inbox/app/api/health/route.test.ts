import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("U15: names the mock provider under AI_PROVIDER=mock", async () => {
    const response = await Promise.resolve(GET());

    expect(await response.json()).toEqual({ ok: true, app: "inbox", provider: "mock" });
  });
});
