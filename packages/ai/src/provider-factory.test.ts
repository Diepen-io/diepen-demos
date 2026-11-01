import { describe, expect, it } from "vitest";
import { activeProviderName, createProvider, getProvider } from "./provider-factory.ts";

describe("createProvider", () => {
  it("uses the mock when AI_PROVIDER is mock, even with a key", () => {
    expect(createProvider({ AI_PROVIDER: "mock", ANTHROPIC_API_KEY: "test-key" }).name).toBe("mock");
  });

  it("uses the mock when no key is set", () => {
    expect(createProvider({}).name).toBe("mock");
    expect(createProvider({ ANTHROPIC_API_KEY: "" }).name).toBe("mock");
  });

  it("uses Claude when a key is set and the mock is not forced", () => {
    expect(createProvider({ ANTHROPIC_API_KEY: "test-key" }).name).toBe("claude");
  });
});

describe("getProvider", () => {
  it("returns the mock under Vitest and caches the instance", () => {
    const provider = getProvider();
    expect(provider.name).toBe("mock");
    expect(getProvider()).toBe(provider);
    expect(activeProviderName()).toBe("mock");
  });
});
