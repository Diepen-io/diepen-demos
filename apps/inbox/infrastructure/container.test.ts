import { createGuards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createContainer } from "./container";

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubProvider: AiProvider = {
  name: "claude",
  streamText: () => {
    throw new Error("not used");
  },
  generateText: () => Promise.reject(new Error("not used")),
  generateObject: () => Promise.reject(new Error("not used")),
};

describe("createContainer", () => {
  it("U15: picks the mock provider under AI_PROVIDER=mock", () => {
    expect(createContainer().providerName).toBe("mock");
  });

  it("F13: answers a website lookup from a fixture page under the mock provider, without the network", async () => {
    const network = vi.fn(() => Promise.reject(new Error("The test made a network request")));
    vi.stubGlobal("fetch", network);

    const page = await createContainer().fetchPage("https://example.com");

    expect(page.html.length).toBeGreaterThan(0);
    expect(network).not.toHaveBeenCalled();
  });

  it("U14: takes the provider and guards a test passes", () => {
    const guards = createGuards({ dailyCap: 0 });
    const container = createContainer({ provider: stubProvider, guards });

    expect(container.providerName).toBe("claude");
    expect(container.guards).toBe(guards);
  });
});
