"use client";

import { useCallback } from "react";
import { useBrand } from "../brand/brand-provider";

/** `filmHref` plus `fallback=limit` (decision S6), keeping its other parameters such as `brand`. */
export function filmFallbackHref(filmHref: string): string {
  const url = new URL(filmHref, "https://demo.invalid");
  url.searchParams.set("fallback", "limit");
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Sends the visitor to the film with the cost guard note, in their own profile. Apps call it only
 * when a cost guard tripped (429); after a failed model call (503) the visitor stays and tries again.
 */
export function useFilmFallback(): () => void {
  const { hrefWithBrand } = useBrand();
  return useCallback(() => window.location.assign(filmFallbackHref(hrefWithBrand("/"))), [hrefWithBrand]);
}
