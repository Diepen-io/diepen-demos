import type { CompanyProfile } from "@diepen/voice/profile";

/**
 * Film text is written with slots such as {company} and {serviceA}, so "Make it yours" swaps the
 * company without a model call. A part in square brackets is optional: it disappears when any
 * slot inside it is empty, for example "[{ServiceA} costs {priceA}. ]" without a listed price.
 */

const slotPattern = /\{(\w+)\}/g;
const optionalPattern = /\[([^[\]]*)\]/g;

const lettersOnly = (name: string) => name.toLowerCase().replace(/[^\p{L}]/gu, "");

/** Lowercase for the middle of a sentence, unless the name starts with an acronym such as "MOT". */
function midSentence(name: string): string {
  const [first = "", second = ""] = name;
  if (second && second === second.toUpperCase() && second !== second.toLowerCase()) return name;
  return first.toLowerCase() + name.slice(1);
}

const sentenceStart = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

const withArticle = (name: string) => (name ? `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}` : "");

function websiteHost(profile: CompanyProfile): string {
  try {
    if (profile.website) return new URL(profile.website).hostname.replace(/^www\./, "");
  } catch {
    // A website that is not a URL falls back to a made-up host below.
  }
  return `${lettersOnly(profile.name)}.example`;
}

/** The value of every slot for one profile. */
export function templateSlots(profile: CompanyProfile): Record<string, string> {
  const [first, second = first] = profile.knowledge.services;
  const serviceA = first ? midSentence(first.name) : "";
  const serviceB = second ? midSentence(second.name) : "";
  return {
    company: profile.name,
    assistant: profile.people.assistantName,
    owner: profile.people.owner.name,
    signOff: profile.voice.signOff,
    serviceA,
    ServiceA: sentenceStart(serviceA),
    aServiceA: withArticle(serviceA),
    priceA: first?.price ?? "",
    serviceB,
    ServiceB: sentenceStart(serviceB),
    priceB: second?.price ?? "",
    location: profile.knowledge.location ?? "",
    minutes: String(profile.knowledge.bookingMinutes),
    handoverMessage: profile.policies.handoverMessage,
    website: websiteHost(profile),
    handle: `@${lettersOnly(profile.name)}`,
  };
}

function fillSlots(text: string, slots: Record<string, string>): string {
  return text.replace(slotPattern, (match, name: string) => slots[name] ?? match);
}

export function fillTemplate(text: string, profile: CompanyProfile): string {
  const slots = templateSlots(profile);
  const withOptionals = text.replace(optionalPattern, (_part, inner: string) => {
    const names = [...inner.matchAll(slotPattern)].map((match) => match[1] ?? "");
    return names.every((name) => slots[name]) ? inner : "";
  });
  return fillSlots(withOptionals, slots);
}
