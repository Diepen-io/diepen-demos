import { MockProvider } from "@diepen/ai/mock-provider";
import type { AiProvider, ObjectRequest } from "@diepen/ai/provider";
import { describe, expect, it, vi } from "vitest";
import { domainProfile, extractBrandProfile } from "./brand-extraction.ts";
import { companyProfileSchema } from "./profile.ts";
import { brandExtractionSchema } from "./tasks/brand-extraction.ts";

const page = {
  url: "https://www.northwind-bakery.example/en/",
  html: `<title>Northwind Bakery</title><meta name="theme-color" content="#fde047"><meta name="description" content="Bread from Kiel."><p>Hello</p>`,
};

describe("extractBrandProfile with the mock provider", () => {
  it("returns a valid draft built from the domain name", async () => {
    const fetchPage = vi.fn(() => Promise.resolve(page));
    const profile = await extractBrandProfile({ url: "https://northwind-bakery.example", fetchPage, provider: new MockProvider() });

    expect(fetchPage).toHaveBeenCalledWith("https://northwind-bakery.example");
    expect(companyProfileSchema.parse(profile)).toEqual(profile);
    expect(profile).toMatchObject({
      id: "northwind-bakery",
      name: "Northwind Bakery",
      fictional: false,
      website: "https://www.northwind-bakery.example",
      tagline: "Bread from Kiel.",
      logo: { kind: "monogram", text: "NB" },
      colors: { brand: "#fde047", brandForeground: "#111111" },
    });
  });

  it("is deterministic and falls back to a default colour with white text", () => {
    const signals = { icons: [], text: "", colors: [] };
    const first = domainProfile("https://acme.example/", signals);
    expect(domainProfile("https://acme.example/", signals)).toEqual(first);
    expect(first.colors).toEqual({ brand: "#334155", brandForeground: "#ffffff" });
    expect(first.logo).toEqual({ kind: "monogram", text: "A" });
  });
});

describe("extractBrandProfile with a model", () => {
  it("sends the signals to the analysis model and fixes what the code knows better", async () => {
    let seen: ObjectRequest<unknown> | undefined;
    const provider: AiProvider = {
      name: "claude",
      streamText: () => (async function* () {})(),
      generateText: () => Promise.resolve(""),
      generateObject: <T>(request: ObjectRequest<T>) => {
        seen = request;
        const draft = brandExtractionSchema.parse({
          ...domainProfile(page.url, { icons: [], text: "", colors: [] }),
          id: "Northwind Bakery GmbH",
          colors: { brand: "#1e3a8a", brandForeground: "#1e3a8a" },
        });
        return Promise.resolve(draft as T);
      },
    };

    const profile = await extractBrandProfile({ url: page.url, fetchPage: () => Promise.resolve(page), provider });

    expect(seen?.role).toBe("analysis");
    expect(seen?.system).toContain("## Your task");
    expect(seen?.messages[0]?.content).toContain('"themeColor": "#fde047"');
    expect(profile.id).toBe("northwind-bakery-gmbh");
    expect(profile.colors.brandForeground).toBe("#ffffff");
  });

  it("replaces a generic owner such as 'The owner' with the team", async () => {
    const provider: AiProvider = {
      name: "claude",
      streamText: () => (async function* () {})(),
      generateText: () => Promise.resolve(""),
      generateObject: <T>() => {
        const base = domainProfile(page.url, { icons: [], text: "", colors: [] });
        return Promise.resolve({ ...base, people: { ...base.people, owner: { name: "The owner", role: "Owner" } } } as T);
      },
    };
    const profile = await extractBrandProfile({ url: page.url, fetchPage: () => Promise.resolve(page), provider });
    expect(profile.people.owner).toEqual({ name: "the team", role: "Team" });
  });
});

describe("domainProfile", () => {
  it("names the team as owner when the page names no person", () => {
    const draft = domainProfile("https://acme.example/", { icons: [], text: "", colors: [] });
    expect(draft.people.owner).toEqual({ name: "the team", role: "Team" });
  });
});
