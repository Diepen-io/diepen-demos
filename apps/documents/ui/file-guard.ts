import { detectMediaType, maxUploadBytes, sniffLength, type AcceptedMediaType } from "@/domain/file-type";

/** The browser's own check before a file is sent, with the same rules as `/api/check`. */

export type GuardedFile = { ok: true; mediaType: AcceptedMediaType } | { ok: false; message: string };

export const tooLargeMessage = "Files up to 4 MB.";
export const wrongTypeMessage = "Use a PDF, PNG or JPEG.";

export async function guardFile(file: File): Promise<GuardedFile> {
  if (file.size > maxUploadBytes) return { ok: false, message: tooLargeMessage };
  const head = new Uint8Array(await file.slice(0, sniffLength).arrayBuffer());
  const mediaType = detectMediaType(head);
  return mediaType ? { ok: true, mediaType } : { ok: false, message: wrongTypeMessage };
}

/** What the file picker offers. The bytes decide; this only narrows the picker. */
export const acceptAttribute = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";
