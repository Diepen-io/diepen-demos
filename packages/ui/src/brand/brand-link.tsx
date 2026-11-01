import { brandParam } from "./profile-store";

/** Parameters that belong to one viewing, not to the company: film time, the cost guard note, recording. */
const viewingParams = ["t", "fallback", "record"] as const;

/**
 * An absolute link to share: `path` (or the current page) on the current origin, with `?brand=`
 * set to the encoded profile and the viewing parameters dropped. Other parameters stay.
 */
export function shareLink(currentHref: string, encodedProfile: string, path?: string): string {
  const current = new URL(currentHref);
  const url = new URL(path ?? current.pathname, current.origin);
  for (const [key, value] of current.searchParams) {
    if (key !== brandParam && !(viewingParams as readonly string[]).includes(key)) url.searchParams.append(key, value);
  }
  url.searchParams.set(brandParam, encodedProfile);
  return url.href;
}

/** A same-site path with the encoded profile, or the plain path when there is none. */
export function pathWithBrand(path: string, encodedProfile: string | null): string {
  return encodedProfile ? `${path}?${brandParam}=${encodedProfile}` : path;
}

/** A full page load, so the next page reads the brand from its URL on the server. */
export function navigateTo(href: string): void {
  window.location.assign(href);
}
