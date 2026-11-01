import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour like #0f766e");

const service = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.string().optional(),
});

const faq = z.object({ question: z.string().min(1), answer: z.string().min(1) });

/**
 * Everything a demo needs to sound and look like one company. Every AI reply in every demo is
 * built from this through `buildSystemPrompt`, and the UI takes its colours and logo from it.
 */
export const companyProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** True for the shipped presets. The screen says so whenever it is true. */
  fictional: z.boolean(),
  industry: z.string().min(1),
  tagline: z.string(),
  website: z.string().optional(),
  logo: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("monogram"), text: z.string().min(1).max(3) }),
    z.object({ kind: z.literal("url"), url: z.string().url() }),
  ]),
  colors: z.object({
    brand: hexColor,
    brandForeground: hexColor,
  }),
  people: z.object({
    owner: z.object({ name: z.string().min(1), role: z.string().min(1) }),
    /** The name the AI signs with, for example "Mia from Northlight". */
    assistantName: z.string().min(1),
  }),
  voice: z.object({
    tone: z.string().min(1),
    wordsToUse: z.array(z.string()),
    wordsToAvoid: z.array(z.string()),
    signOff: z.string(),
  }),
  policies: z.object({
    /** What the AI may commit to on its own. */
    mayPromise: z.array(z.string()),
    /** What it must never promise. */
    neverPromise: z.array(z.string()),
    /** When it stops and hands the conversation to a human. */
    handoverWhen: z.array(z.string()),
    handoverMessage: z.string().min(1),
  }),
  knowledge: z.object({
    services: z.array(service),
    openingHours: z.string(),
    location: z.string().optional(),
    contactEmail: z.string(),
    phone: z.string().optional(),
    faq: z.array(faq),
    /** Length of a bookable slot in the simulated calendar. */
    bookingMinutes: z.number().int().positive(),
  }),
});

export type CompanyProfile = z.infer<typeof companyProfileSchema>;
