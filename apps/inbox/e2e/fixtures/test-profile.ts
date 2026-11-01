import type { CompanyProfile } from "@diepen/voice/profile";

/**
 * A fictional plumbing company that is none of the presets, with `fictional: false`, so a test sees
 * the "own profile" wording. The phone number is in the UK range reserved for drama.
 */
export const testProfile: CompanyProfile = {
  id: "copperline-plumbing",
  name: "Copperline Plumbing",
  fictional: false,
  industry: "Plumbing and heating",
  tagline: "Boilers, leaks and bathrooms in Wexmoor.",
  website: "https://copperline-plumbing.example",
  logo: { kind: "monogram", text: "CP" },
  colors: { brand: "#b45309", brandForeground: "#ffffff" },
  people: {
    owner: { name: "Rhea Castell", role: "Master plumber and owner" },
    assistantName: "Finn from Copperline",
  },
  voice: {
    tone: "Practical and friendly. Say what happens next and when.",
    wordsToUse: ["visit", "quote", "boiler service"],
    wordsToAvoid: ["cheap", "guaranteed"],
    signOff: "Cheers,\nFinn from Copperline Plumbing",
  },
  policies: {
    mayPromise: ["Offer open visit slots from the calendar", "Confirm the listed prices"],
    neverPromise: ["A fixed price for a repair nobody has seen", "Same-day visits that are not in the calendar"],
    handoverWhen: ["A complaint", "A refund request", "A gas smell or a flood"],
    handoverMessage: "Thanks for telling me. Rhea will call you back today.",
  },
  knowledge: {
    services: [
      { name: "Boiler service", description: "Yearly check and safety report.", price: "EUR 95" },
      { name: "Leak repair", description: "Find and fix a leak under a sink or a bath.", price: "from EUR 80" },
    ],
    openingHours: "Monday to Friday 7:30 to 17:00.",
    location: "12 Foundry Street, Wexmoor",
    contactEmail: "hello@copperline-plumbing.example",
    phone: "07700 900318",
    faq: [],
    bookingMinutes: 60,
  },
};
