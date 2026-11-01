"use client";

import { FallbackNote } from "@diepen/ui/shell/fallback-note";
import { setUrlParam, useUrlParam } from "@diepen/ui/shell/url-param";

/** The cost guard note over the film, after live mode sent the visitor here with `?fallback=limit`. */
export function FallbackToast() {
  if (useUrlParam("fallback") !== "limit") return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <FallbackNote
        className="enter pointer-events-auto w-full max-w-[560px] shadow-[0_0_0_1px_color-mix(in_oklab,var(--wait)_25%,white),0_12px_32px_-12px_rgb(0_0_0/0.3)]"
        onDismiss={() => setUrlParam("fallback", null)}
      />
    </div>
  );
}
