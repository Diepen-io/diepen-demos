import type { AiProvider } from "@diepen/ai/provider";
import { readableForeground } from "./color-contrast.ts";
import { extractHtmlSignals, type HtmlSignals } from "./html-signals.ts";
import type { PageFetcher } from "./page-fetcher.ts";
import type { CompanyProfile } from "./profile.ts";
import { buildSystemPrompt } from "./prompt.ts";
import { brandExtractionSchema, brandExtractionTask, type BrandExtraction } from "./tasks/brand-extraction.ts";

export type BrandExtractionInput = {
  url: string;
  fetchPage: PageFetcher;
  provider: AiProvider;
};

const defaultBrand = "#334155";

function domainWords(pageUrl: string): string[] {
  const label = new URL(pageUrl).hostname.replace(/^www\./, "").split(".")[0] ?? "";
  return label.split(/[-_]+/).filter(Boolean);
}

const titleCase = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

function slug(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
}

/**
 * The profile the mock provider returns: deterministic and built from the domain name only, so
 * keyless and test runs show a believable draft without a model.
 */
export function domainProfile(pageUrl: string, signals: HtmlSignals): BrandExtraction {
  const words = domainWords(pageUrl);
  const name = words.map(titleCase).join(" ") || "Your Company";
  const monogram = (words.length > 1 ? words.slice(0, 2).map((w) => w[0]) : [words[0]?.[0] ?? "Y"]).join("").toUpperCase();
  const brand = signals.themeColor ?? defaultBrand;
  return {
    id: slug(name),
    name,
    fictional: false,
    industry: "Small business",
    tagline: signals.description ?? "",
    website: new URL(pageUrl).origin,
    logo: { kind: "monogram", text: monogram },
    colors: { brand, brandForeground: readableForeground(brand) },
    people: { owner: { name: "The owner", role: "Owner" }, assistantName: `${name} assistant` },
    voice: {
      tone: "Friendly, clear and helpful. Short sentences and plain words.",
      wordsToUse: ["happy to help", "appointment", "thank you"],
      wordsToAvoid: ["guaranteed", "cheap", "unbeatable"],
      signOff: `Best regards,\n${name}`,
    },
    policies: {
      mayPromise: ["Answer questions the company knowledge covers", "Offer open appointment slots"],
      neverPromise: ["Prices that are not listed", "Discounts", "Professional advice"],
      handoverWhen: ["A complaint", "A refund request", "Legal questions", "Anything the company knowledge does not answer"],
      handoverMessage: "Thank you. I have passed this to the team, and a person will get back to you soon.",
    },
    knowledge: {
      services: [],
      openingHours: "Not listed on the website",
      contactEmail: "",
      faq: [],
      bookingMinutes: 30,
    },
  };
}

function signalsMessage(signals: HtmlSignals): string {
  return `Website signals:\n${JSON.stringify(signals, null, 2)}`;
}

/** Reads a website and drafts the profile of the business behind it with the analysis model. */
export async function extractBrandProfile({ url, fetchPage, provider }: BrandExtractionInput): Promise<CompanyProfile> {
  const page = await fetchPage(url);
  const signals = extractHtmlSignals(page.html, page.url);

  const draft = await provider.generateObject({
    role: brandExtractionTask.role,
    system: buildSystemPrompt({ task: brandExtractionTask, context: { url: page.url } }),
    messages: [{ role: "user", content: signalsMessage(signals) }],
    schema: brandExtractionSchema,
    mock: () => domainProfile(page.url, signals),
  });

  // The model drafts the content; facts the code knows better are set here.
  return {
    ...draft,
    id: slug(draft.id || draft.name),
    website: new URL(page.url).origin,
    colors: { brand: draft.colors.brand, brandForeground: readableForeground(draft.colors.brand) },
  };
}
