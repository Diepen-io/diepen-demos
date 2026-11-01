import type { CompanyProfile } from "@diepen/voice/profile";
import { fillTokens, profileTokens } from "@/domain/profile-tokens";
import { sampleCall } from "@/film/fixtures/sample-call";

/** The sample call as the visitor sees it: tokens filled from the profile. */
export function filledSampleCall(profile: CompanyProfile): string {
  return fillTokens(sampleCall, profileTokens(profile));
}

/** Fills tokens in every string of a value, for fixtures typed as objects. */
export function fillTokensDeep<T>(value: T, profile: CompanyProfile): T {
  const tokens = profileTokens(profile);
  const fill = (item: unknown): unknown => {
    if (typeof item === "string") return fillTokens(item, tokens);
    if (Array.isArray(item)) return item.map(fill);
    if (item && typeof item === "object") {
      return Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, fill(entry)]));
    }
    return item;
  };
  return fill(value) as T;
}
