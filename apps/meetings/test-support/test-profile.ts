import { defaultPresetFor } from "@diepen/voice/presets";
import type { CompanyProfile } from "@diepen/voice/profile";

/** The profile the meetings demo opens with: Brickfern Property Management, owner Jonas Albers. */
export const meetingsPreset: CompanyProfile = defaultPresetFor("meetings");

/**
 * A visitor's own profile for tests: its own name, owner, colour, price, sign-off and meeting
 * length, so a test can tell it apart from the preset. Fictional, like every profile in tests.
 */
export const testProfile: CompanyProfile = {
  ...meetingsPreset,
  id: "harbourline-lettings",
  name: "Harbourline Lettings",
  fictional: true,
  website: "https://harbourline.example",
  logo: { kind: "monogram", text: "HL" },
  colors: { brand: "#1d4ed8", brandForeground: "#ffffff" },
  people: { owner: { name: "Mara Quist", role: "Owner" }, assistantName: "Ivy from Harbourline" },
  voice: { ...meetingsPreset.voice, signOff: "Kind regards,\nMara" },
  knowledge: {
    ...meetingsPreset.knowledge,
    services: [
      { name: "Free intro call", description: "Thirty minutes on how we would run your flats." },
      {
        name: "Lettings management",
        description: "Tenant calls, repairs, viewings and a monthly owner statement.",
        price: "GBP 29 per flat per month",
      },
      { name: "Inventory report", description: "A photo report at move-in.", price: "GBP 95 per visit" },
    ],
    contactEmail: "hello@harbourline.example",
    bookingMinutes: 45,
  },
};

/** The same profile with no priced service, for the "Price on request" rule. */
export const unpricedProfile: CompanyProfile = {
  ...testProfile,
  id: "harbourline-unpriced",
  knowledge: {
    ...testProfile.knowledge,
    services: testProfile.knowledge.services.map(({ name, description }) => ({ name, description })),
  },
};
