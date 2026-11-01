import { lookup as dnsLookup } from "node:dns/promises";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP, type LookupFunction } from "node:net";
import type { Readable } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { isPublicAddress } from "./public-address.ts";

/**
 * Fetches one public web page for brand extraction. The visitor picks the URL, so this is an SSRF
 * surface: the address check runs inside the socket's own DNS lookup, which means the address that
 * was checked is the address that gets connected, on the first request and on every redirect.
 */

export type FetchedPage = { url: string; html: string };

/** The port brand extraction depends on. Tests and other hosts pass their own. */
export type PageFetcher = (url: string) => Promise<FetchedPage>;

export type ResolvedAddress = { address: string; family: number };
export type Resolver = (hostname: string) => Promise<ResolvedAddress[]>;

/** A failure the visitor can fix or should know about. Its message is safe to show. */
export class PageFetchError extends Error {
  override readonly name = "PageFetchError";
}

export type PageFetcherOptions = {
  resolve?: Resolver;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
};

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const defaultResolver: Resolver = (hostname) => dnsLookup(hostname, { all: true, verbatim: true });

function guardedLookup(resolve: Resolver): LookupFunction {
  return (hostname, options, callback) => {
    resolve(hostname).then(
      (resolved) => {
        const addresses = options.family ? resolved.filter((a) => a.family === options.family) : resolved;
        // One private answer refuses the host: a mixed answer is how DNS rebinding starts.
        if (addresses.length === 0 || resolved.some((a) => !isPublicAddress(a.address))) {
          callback(new PageFetchError("That address is not a public website."), "", 0);
        } else if (options.all) {
          callback(null, addresses);
        } else {
          const [first] = addresses as [ResolvedAddress];
          callback(null, first.address, first.family);
        }
      },
      () => callback(new PageFetchError("We could not find that website."), "", 0),
    );
  };
}

function checkTarget(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new PageFetchError("Use a website address that starts with http or https.");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new PageFetchError("Use a website on the standard web ports.");
  }
  // The socket skips DNS for an IP literal, so the lookup check never sees it.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && !isPublicAddress(host)) {
    throw new PageFetchError("That address is not a public website.");
  }
}

function send(url: URL, lookup: LookupFunction, signal: AbortSignal): Promise<IncomingMessage> {
  const request = url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const outgoing = request(url, {
      method: "GET",
      lookup,
      signal,
      headers: {
        "user-agent": userAgent,
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en,de;q=0.8",
      },
    }, resolve);
    outgoing.on("error", reject);
    outgoing.end();
  });
}

function decompressed(response: IncomingMessage): Readable {
  const encoding = response.headers["content-encoding"]?.toLowerCase();
  const decoder =
    encoding === "gzip" ? createGunzip() : encoding === "deflate" ? createInflate() : encoding === "br" ? createBrotliDecompress() : undefined;
  if (!decoder) return response;
  response.on("error", (error) => decoder.destroy(error));
  return response.pipe(decoder);
}

async function readBody(response: IncomingMessage, maxBytes: number): Promise<Buffer> {
  if (Number(response.headers["content-length"]) > maxBytes) {
    response.destroy();
    throw new PageFetchError("That page is too large to read.");
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of decompressed(response)) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > maxBytes) {
      response.destroy();
      throw new PageFetchError("That page is too large to read.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function decodeText(body: Buffer, contentType: string): string {
  const charset = /charset=["']?([\w-]+)/i.exec(contentType)?.[1] ?? "utf-8";
  try {
    return new TextDecoder(charset).decode(body);
  } catch {
    return new TextDecoder("utf-8").decode(body);
  }
}

function asFetchError(error: unknown): PageFetchError {
  if (error instanceof PageFetchError) return error;
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return new PageFetchError("That website took too long to answer.");
  }
  return new PageFetchError("We could not reach that website.");
}

export function createPageFetcher(options: PageFetcherOptions = {}): PageFetcher {
  const lookup = guardedLookup(options.resolve ?? defaultResolver);
  const timeoutMs = options.timeoutMs ?? 6_000;
  const maxBytes = options.maxBytes ?? 1_500_000;
  const maxRedirects = options.maxRedirects ?? 3;

  return async (input) => {
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      throw new PageFetchError("That is not a website address.");
    }
    const signal = AbortSignal.timeout(timeoutMs);

    try {
      for (let redirects = 0; ; redirects += 1) {
        checkTarget(url);
        const response = await send(url, lookup, signal);
        const status = response.statusCode ?? 0;
        const location = response.headers.location;

        if (status >= 300 && status < 400 && location) {
          response.resume();
          if (redirects >= maxRedirects) throw new PageFetchError("That website redirects too often.");
          url = new URL(location, url);
          continue;
        }
        if (status < 200 || status >= 300) {
          response.resume();
          throw new PageFetchError(`That website answered with status ${status}.`);
        }
        const contentType = response.headers["content-type"] ?? "";
        if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
          response.resume();
          throw new PageFetchError("That address is not a web page.");
        }
        return { url: url.href, html: decodeText(await readBody(response, maxBytes), contentType) };
      }
    } catch (error) {
      throw asFetchError(error);
    }
  };
}

/** The fetcher routes use, with the real DNS resolver. */
export const fetchPage: PageFetcher = createPageFetcher();
