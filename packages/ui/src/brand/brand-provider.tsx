"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { createContext, use, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { brandParam, createProfileStore } from "./profile-store";

export type BrandContextValue = {
  profile: CompanyProfile;
  defaultProfile: CompanyProfile;
  /** Applies a profile, saves it in local storage and puts it in the `?brand=` URL parameter. */
  setProfile: (profile: CompanyProfile) => void;
  /** Goes back to the app's default preset and clears storage and the URL parameter. */
  resetProfile: () => void;
  /** A same-site link that keeps the active profile, for the Film and Live switch. */
  hrefWithBrand: (path: string) => string;
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
  /** Layout for the wrapper that carries the brand colours. Without it the wrapper adds no box. */
  className?: string;
  children: ReactNode;
};

export function BrandProvider({ defaultProfile, brandParamValue, className, children }: BrandProviderProps) {
  const [store] = useState(() => createProfileStore(defaultProfile, brandParamValue));
  const profile = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const value = useMemo<BrandContextValue>(() => {
    const encoded = profile === defaultProfile ? null : encodeProfile(profile);
    return {
      profile,
      defaultProfile,
      setProfile: store.set,
      resetProfile: store.reset,
      hrefWithBrand: (path) => (encoded ? `${path}?${brandParam}=${encoded}` : path),
    };
  }, [profile, defaultProfile, store]);

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
