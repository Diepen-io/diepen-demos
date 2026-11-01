import type { CompanyProfile } from "@diepen/voice/profile";
import { firstName } from "./person-name";
import { sellerLabels, sellerOf } from "./seller";
import type { SpeakerTurn } from "./transcript";

export type CallSides = { seller: string; prospect: string };

/** The prospect's label when only one person speaks, and the prospect's side in a recording. */
export const unnamedProspect = "Prospect";

/**
 * The seller is the first speaker named like the profile's owner (their first name, in any case)
 * or labelled as the seller ("You", the company), else the first speaker. The prospect is the
 * first speaker who is not the seller.
 */
export function identifySides(turns: readonly SpeakerTurn[], profile: CompanyProfile): CallSides {
  const seller = sellerOf(profile);
  const labels = sellerLabels(seller);
  const ownerFirst = seller.person ? firstName(seller.person).toLowerCase() : null;
  const isSeller = (speaker: string) => {
    const name = speaker.toLowerCase();
    return labels.includes(name) || (ownerFirst !== null && name.includes(ownerFirst));
  };
  const speakers = [...new Set(turns.map((turn) => turn.speaker))];
  const sellerSpeaker = speakers.find(isSeller) ?? speakers[0] ?? seller.speaker;
  const prospect = speakers.find((speaker) => speaker !== sellerSpeaker) ?? unnamedProspect;
  return { seller: sellerSpeaker, prospect };
}
