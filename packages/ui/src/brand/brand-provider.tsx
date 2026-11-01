"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { createContext, use, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { navigateTo, pathWithBrand, shareLink } from "./brand-link";
import { createProfileStore } from "./profile-store";

export type BrandContextValue = {
  /** The company this page shows. In fixed mode always `defaultProfile`. */
  profile: CompanyProfile;
  /**
   * The visitor's own profile: `?brand=`, then local storage, then `defaultProfile`. Equal to
   * `profile` outside fixed mode. "Make it yours" edits this one.
   */
  savedProfile: CompanyProfile;
  defaultProfile: CompanyProfile;
  /** True on a page that always shows its own company, such as a film (decision F1). */
  fixed: boolean;
  /**
   * Saves a profile in local storage and in `?brand=`. Outside fixed mode the page shows it at
   * once; in fixed mode the browser opens live mode with it.
   */
  setProfile: (profile: CompanyProfile) => void;
  /** Goes back to the app's default preset and clears storage and the URL parameter. */
  resetProfile: () => void;
  /** A same-site link that keeps the visitor's profile, for the Film and Live switch. */
  hrefWithBrand: (path: string) => string;
  /** An absolute link that always carries the visitor's profile. In fixed mode it points at live mode. */
  shareHref: () => string;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export function useBrand(): BrandContextValue {
  const value = use(BrandContext);
  if (!value) throw new Error("useBrand needs a BrandProvider above it.");
  return value;
}

export type BrandProviderProps = {
  /** The app's default preset, used when neither the URL nor local storage holds a profile. */
  defaultProfile: CompanyProfile;
  /** The page's own `?brand=` value from searchParams, so the server renders the shared brand. */
  brandParamValue?: string | null;
  /**
   * Always show `defaultProfile`, whatever `?brand=` or local storage hold. Links to live mode
   * still carry the visitor's profile, and applying one opens `livePath`. For film pages.
   */
  fixed?: boolean;
  /** Where fixed mode sends the visitor after they apply a profile. */
  livePath?: string;
  /** Layout for the wrapper that carries the brand colours. Without it the wrapper adds no box. */
  className?: string;
  children: ReactNode;
};

export function BrandProvider({
  defaultProfile,
  brandParamValue,
  fixed = false,
  livePath = "/live",
  className,
  children,
}: BrandProviderProps) {
  const [store] = useState(() => createProfileStore(defaultProfile, brandParamValue));
  const savedProfile = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const profile = fixed ? defaultProfile : savedProfile;

  const value = useMemo<BrandContextValue>(() => {
    const encoded = savedProfile === defaultProfile ? null : encodeProfile(savedProfile);
    return {
      profile,
      savedProfile,
      defaultProfile,
      fixed,
      setProfile: fixed
        ? (next) => {
            store.set(next);
            navigateTo(pathWithBrand(livePath, encodeProfile(next)));
          }
        : store.set,
      resetProfile: store.reset,
      hrefWithBrand: (path) => pathWithBrand(path, encoded),
      shareHref: () => shareLink(window.location.href, encodeProfile(savedProfile), fixed ? livePath : undefined),
    };
  }, [profile, savedProfile, defaultProfile, fixed, livePath, store]);

  const style = {
    "--brand": profile.colors.brand,
    "--brand-foreground": profile.colors.brandForeground,
  } as CSSProperties;

  return (
    <BrandContext value={value}>
      <div data-brand-scope="" style={style} className={className ?? "contents"}>
        {children}
      </div>
    </BrandContext>
  );
}
