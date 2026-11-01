/** The owner name a brand draft uses when the website names no person. */
export const teamOwner = { name: "the team", role: "Team" } as const;

const titles = new Set(["dr", "mr", "mrs", "ms", "miss", "mx", "prof", "sir", "dame"]);

/**
 * The name to greet a person by: "Dr. Lena Okafor" gives "Lena". A name that starts with "the",
 * such as "the team", is a group, not a person, and comes back whole.
 */
export function firstName(fullName: string): string {
  const name = fullName.trim();
  if (/^the\s/i.test(name)) return name;
  const words = name.split(/\s+/).filter(Boolean);
  const first = words.find((word) => !titles.has(word.toLowerCase().replace(/\.$/, "")));
  return first ?? name;
}
