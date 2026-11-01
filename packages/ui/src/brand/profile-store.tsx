import type { CompanyProfile } from "@diepen/voice/profile";
import { decodeProfile, encodeProfile } from "@diepen/voice/profile-codec";

export const brandParam = "brand";
export const brandStorageKey = "diepen-demos:brand";

export type ProfileStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CompanyProfile;
  getServerSnapshot: () => CompanyProfile;
  set: (profile: CompanyProfile) => void;
  reset: () => void;
};

function readUrl(): CompanyProfile | null {
  return decodeProfile(new URLSearchParams(window.location.search).get(brandParam) ?? "");
}

// Storage throws in private windows and when the visitor blocks site data. The demo still runs.
function readStorage(): CompanyProfile | null {
  try {
    const stored = window.localStorage.getItem(brandStorageKey);
    return stored ? decodeProfile(stored) : null;
  } catch {
    return null;
  }
}

function writeStorage(encoded: string | null) {
  try {
    if (encoded) window.localStorage.setItem(brandStorageKey, encoded);
    else window.localStorage.removeItem(brandStorageKey);
  } catch {
    // Without storage the profile still travels in the URL.
  }
}

function writeUrl(encoded: string | null) {
  const url = new URL(window.location.href);
  if (encoded) url.searchParams.set(brandParam, encoded);
  else url.searchParams.delete(brandParam);
  window.history.replaceState(window.history.state, "", url);
}

/**
 * Holds the active profile for one BrandProvider. The first read in the browser picks the
 * `?brand=` parameter, then local storage, then the app's default preset. The server renders
 * with `serverParam` (the page's own `?brand=`) or the default, so hydration matches the URL.
 */
export function createProfileStore(defaultProfile: CompanyProfile, serverParam?: string | null): ProfileStore {
  const serverProfile = (serverParam ? decodeProfile(serverParam) : null) ?? defaultProfile;
  const listeners = new Set<() => void>();
  let current: CompanyProfile | null = null;

  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      current ??= readUrl() ?? readStorage() ?? defaultProfile;
      return current;
    },
    getServerSnapshot: () => serverProfile,
    set(profile) {
      const encoded = encodeProfile(profile);
      current = profile;
      writeStorage(encoded);
      writeUrl(encoded);
      notify();
    },
    reset() {
      current = defaultProfile;
      writeStorage(null);
      writeUrl(null);
      notify();
    },
  };
}
