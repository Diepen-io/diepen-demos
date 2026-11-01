import type { CallSides } from "@/domain/call-sides";
import { isPersonName, unnamedContact } from "@/domain/person-name";
import type { Seller } from "@/domain/seller";
import type { SpeakerTurn } from "@/domain/transcript";

/** Who the keyless mock writes to, read from the transcript with plain text rules. */
export type Contact = {
  /** The prospect's name, or "New contact" when the call never says it. */
  name: string;
  named: boolean;
  /** The company the prospect named, or null. */
  company: string | null;
  email: string | null;
};

const capitalisedWords = String.raw`\p{Lu}[\p{L}&'.-]*(?:\s+\p{Lu}[\p{L}&'.-]*){0,3}`;
/** "that's the company, Becker Residential" or "my company is called Northgate Homes". */
const companyNamed = new RegExp(String.raw`\bcompany(?:'s| is)?,?\s+(?:called\s+)?(${capitalisedWords})`, "u");
const companySuffix = new RegExp(
  String.raw`\b((?:\p{Lu}[\p{L}&'-]*\s+){1,3}(?:Residential|Properties|Homes|Lettings|Estates|Group|Holdings|Partners|GmbH|Ltd|LLC|Inc))\b`,
  "u",
);
const emailPattern = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
/** The seller greets the prospect: "Hi Rosa," or "Thanks for joining, Rosa." */
const greeting = /\b(?:[Hh]i|[Hh]ello|[Hh]ey|[Mm]orning|[Aa]fternoon|[Tt]hanks|[Tt]hank you)\b[^.?!]*?\b(\p{Lu}\p{Ll}+)\b/u;
const notNames = new Set(["There", "Everyone", "All", "Team", "So", "For"]);

function textsOf(turns: readonly SpeakerTurn[], speaker: string): string[] {
  return turns.filter((turn) => turn.speaker === speaker).map((turn) => turn.text);
}

function firstMatch(texts: readonly string[], pattern: RegExp): string | null {
  for (const text of texts) {
    const match = pattern.exec(text);
    const found = (match?.[1] ?? match?.[0])?.replace(/[.'-]+$/, "").trim();
    if (found) return found;
  }
  return null;
}

/** A recorded call labels the prospect "Prospect"; the seller's greeting often says their name. */
function greetedName(turns: readonly SpeakerTurn[], sides: CallSides, seller: Seller): string | null {
  const sellerWords = `${sides.seller} ${seller.described}`;
  for (const text of textsOf(turns, sides.seller)) {
    const name = greeting.exec(text)?.[1];
    if (name && !notNames.has(name) && !sellerWords.includes(name)) return name;
  }
  return null;
}

export function readContact(turns: readonly SpeakerTurn[], sides: CallSides, seller: Seller): Contact {
  const said = textsOf(turns, sides.prospect);
  const name = isPersonName(sides.prospect) ? sides.prospect : greetedName(turns, sides, seller);
  return {
    name: name ?? unnamedContact,
    named: name !== null,
    company: firstMatch(said, companyNamed) ?? firstMatch(said, companySuffix),
    email: firstMatch(said, emailPattern),
  };
}
