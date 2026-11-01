import type { CompanyProfile } from "@diepen/voice/profile";
import { describe, expect, it } from "vitest";
import { fillTemplate } from "./message-template";

// A fictional clinic written out here, because domain tests may import only @diepen/voice/profile.
const clinic: CompanyProfile = {
  id: "harbourlight-dental",
  name: "Harbourlight Dental",
  fictional: true,
  industry: "Dental clinic",
  tagline: "Dentistry by the harbour.",
  website: "https://harbourlight-dental.example/about",
  logo: { kind: "monogram", text: "HD" },
  colors: { brand: "#0f766e", brandForeground: "#ffffff" },
  people: { owner: { name: "Dr. Ines Varga", role: "Dentist" }, assistantName: "Lio from Harbourlight" },
  voice: { tone: "Warm.", wordsToUse: [], wordsToAvoid: [], signOff: "Warm regards,\nLio" },
  policies: {
    mayPromise: [],
    neverPromise: [],
    handoverWhen: ["A refund request"],
    handoverMessage: "I have passed this to our team.",
  },
  knowledge: {
    services: [
      { name: "Check-up and consultation", description: "A full check.", price: "EUR 65" },
      { name: "Professional teeth cleaning", description: "60 minutes.", price: "EUR 120" },
    ],
    openingHours: "Monday to Friday 8:00 to 18:00.",
    location: "2 Pier Road, Saltmere",
    contactEmail: "hello@harbourlight-dental.example",
    faq: [],
    bookingMinutes: 45,
  },
};

const withServices = (services: CompanyProfile["knowledge"]["services"]): CompanyProfile => ({
  ...clinic,
  knowledge: { ...clinic.knowledge, services },
});

const allSlots =
  "{company} {assistant} {owner} {signOff} {serviceA} {ServiceA} {aServiceA} {priceA} " +
  "{serviceB} {ServiceB} {priceB} {location} {minutes} {handoverMessage} {website} {handle}";

describe("fillTemplate", () => {
  it("U9: replaces every slot", () => {
    const filled = fillTemplate(allSlots, clinic);

    expect(filled).not.toMatch(/[{}]/);
    expect(filled).toContain("Harbourlight Dental");
    expect(filled).toContain("Lio from Harbourlight");
    expect(filled).toContain("Dr. Ines Varga");
    expect(filled).toContain("I have passed this to our team.");
  });

  it("U9: fills the names, prices, place and length from the profile", () => {
    expect(fillTemplate("{ServiceA} costs {priceA}.", clinic)).toBe("Check-up and consultation costs EUR 65.");
    expect(fillTemplate("{ServiceB} is {priceB}.", clinic)).toBe("Professional teeth cleaning is EUR 120.");
    expect(fillTemplate("See you at {location}.", clinic)).toBe("See you at 2 Pier Road, Saltmere.");
    expect(fillTemplate("A {minutes}-minute call", clinic)).toBe("A 45-minute call");
  });

  it("U9: lowercases the first letter of a service mid-sentence", () => {
    expect(fillTemplate("Your {serviceA} is booked.", clinic)).toBe("Your check-up and consultation is booked.");
  });

  it("U9: keeps the case of a service that starts with an acronym", () => {
    const profile = withServices([{ name: "MOT inspection", description: "" }]);

    expect(fillTemplate("Your {serviceA} is booked.", profile)).toBe("Your MOT inspection is booked.");
  });

  it("U9: writes a before a consonant and an before a vowel", () => {
    expect(fillTemplate("I'd like {aServiceA}.", clinic)).toBe("I'd like a check-up and consultation.");

    const profile = withServices([{ name: "Initial consultation", description: "" }]);
    expect(fillTemplate("I'd like {aServiceA}.", profile)).toBe("I'd like an initial consultation.");
  });

  it("U9: falls back to the first service when there is no second one", () => {
    const profile = withServices([{ name: "Check-up and consultation", description: "", price: "EUR 65" }]);

    expect(fillTemplate("do you do {serviceB}?", profile)).toBe("do you do check-up and consultation?");
  });

  it("U9: keeps an optional part when its slots are filled", () => {
    expect(fillTemplate("Yes. [{ServiceA} costs {priceA}. ]Which mornings suit you?", clinic)).toBe(
      "Yes. Check-up and consultation costs EUR 65. Which mornings suit you?",
    );
  });

  it("U9: drops an optional part with an empty slot", () => {
    const profile = withServices([{ name: "Check-up and consultation", description: "" }]);

    expect(fillTemplate("Yes. [{ServiceA} costs {priceA}. ]Which mornings suit you?", profile)).toBe(
      "Yes. Which mornings suit you?",
    );
    expect(fillTemplate("Booked[ at {location}].", { ...clinic, knowledge: { ...clinic.knowledge, location: undefined } })).toBe(
      "Booked.",
    );
  });

  it("U9: shows the website host, or a made-up host from the company name", () => {
    expect(fillTemplate("{website}", clinic)).toBe("harbourlight-dental.example");
    expect(fillTemplate("{website}", { ...clinic, website: undefined })).toBe("harbourlightdental.example");
  });

  it("U9: builds the Instagram handle from the company name", () => {
    expect(fillTemplate("{handle}", clinic)).toBe("@harbourlightdental");
  });
});
