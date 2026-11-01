import { z } from "zod";
import { companyProfileSchema } from "../profile.ts";
import type { TaskSpec } from "../task-spec.ts";

export type BrandExtractionContext = {
  /** The page the signals come from, after redirects. */
  url: string;
};

/** A draft profile of a real business, so `fictional` is always false. */
export const brandExtractionSchema = companyProfileSchema.extend({ fictional: z.literal(false) });

export type BrandExtraction = z.infer<typeof brandExtractionSchema>;

export const brandExtractionTask: TaskSpec<BrandExtractionContext, BrandExtraction> = {
  id: "brand-extraction",
  role: "analysis",
  instructions: () =>
    [
      "The last message holds signals from the home page of a small business: title, description, colours, icons and the visible text.",
      "Write a draft company profile for an AI assistant that answers this business's customers. The owner edits the draft afterwards.",
      "",
      "- Use only facts from the signals. Leave a service's price out when the page shows none. Write 'Not listed on the website' for missing opening hours and an empty string for a missing email.",
      "- tone: describe how the business writes, based on its real sentences, in two or three sentences. wordsToUse are words the page itself uses; wordsToAvoid are words that would not fit that tone.",
      "- services and faq: only what the page offers or answers.",
      "- policies: mayPromise only what the page commits to. neverPromise and handoverWhen always cover complaints, refunds, legal questions, professional advice for the industry, and anything the knowledge does not answer.",
      "- people: use names from the page. When the page names no person, use 'the team' (lowercase) as the owner's name and 'Team' as the role; never invent a name or write 'The owner'. The assistant name is '<business name> assistant' unless the page names one.",
      "- colors.brand: the theme colour, else the most frequent colour that is not white, black or grey.",
      "- logo: a monogram of one to three letters from the business name.",
      "- bookingMinutes: 30 unless the page states a length.",
      "- id: the business name in lowercase with hyphens.",
    ].join("\n"),
  outputSchema: brandExtractionSchema,
};
