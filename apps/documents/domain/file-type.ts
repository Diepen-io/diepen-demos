/**
 * Which files a check accepts. The type comes from the first bytes, never from the name or the
 * browser's guess, so a renamed text file is refused in the browser and on the server alike.
 */

export const acceptedMediaTypes = ["application/pdf", "image/png", "image/jpeg"] as const;

export type AcceptedMediaType = (typeof acceptedMediaTypes)[number];

/** Vercel caps a request body at 4.5 MB; one file plus the form fields stays under it. */
export const maxUploadBytes = 4_000_000;

const signatures: readonly { mediaType: AcceptedMediaType; bytes: readonly number[] }[] = [
  { mediaType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { mediaType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mediaType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
];

/** The bytes a sniff needs from the start of a file. */
export const sniffLength = 8;

export function detectMediaType(head: Uint8Array): AcceptedMediaType | null {
  const match = signatures.find(({ bytes }) => bytes.every((byte, index) => head[index] === byte));
  return match?.mediaType ?? null;
}
