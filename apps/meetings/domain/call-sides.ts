import type { CompanyProfile } from "@diepen/voice/profile";
import type { SpeakerTurn } from "./transcript";

export type CallSides = { seller: string; prospect: string };

/** Used when only one person speaks in the transcript. */
export const unnamedProspect = "Prospect";

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * The seller is the first speaker whose name holds the profile owner's first name, else the
 * first speaker. The prospect is the first speaker who is not the seller.
 */
export function identifySides(turns: readonly SpeakerTurn[], profile: CompanyProfile): CallSides {
  const ownerFirst = firstName(profile.people.owner.name).toLowerCase();
  const speakers = [...new Set(turns.map((turn) => turn.speaker))];
  const seller =
    speakers.find((speaker) => ownerFirst && speaker.toLowerCase().includes(ownerFirst)) ??
    speakers[0] ??
    profile.people.owner.name;
  const prospect = speakers.find((speaker) => speaker !== seller) ?? unnamedProspect;
  return { seller, prospect };
}
