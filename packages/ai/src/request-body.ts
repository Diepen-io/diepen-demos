/**
 * Reads a request body with a hard byte cap. `request.text()` buffers everything before a size
 * check can run, so a large or endless body would sit in memory first. This checks the declared
 * Content-Length, then counts bytes as chunks arrive and stops reading at the cap.
 */
export class BodyTooLargeError extends Error {
  constructor(readonly maxBytes: number) {
    super(`The request body is larger than ${maxBytes} bytes.`);
    this.name = "BodyTooLargeError";
  }
}

export async function readBodyBytes(request: Request, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new BodyTooLargeError(maxBytes);
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new BodyTooLargeError(maxBytes);
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function readBodyText(request: Request, maxBytes: number): Promise<string> {
  return new TextDecoder().decode(await readBodyBytes(request, maxBytes));
}
