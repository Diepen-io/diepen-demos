"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { useState } from "react";
import { initials } from "../primitives/avatar";
import { cx } from "../primitives/class-names";

export type BrandMarkProps = {
  profile: Pick<CompanyProfile, "name" | "logo" | "colors">;
  size?: number;
  className?: string;
};

/** The company logo, or its monogram in the brand colours when there is no logo or it fails to load. */
export function BrandMark({ profile, size = 32, className }: BrandMarkProps) {
  const logoUrl = profile.logo.kind === "url" ? profile.logo.url : null;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const radius = Math.round(size * 0.28);

  if (logoUrl && failedUrl !== logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${profile.name} logo`}
        width={size}
        height={size}
        onError={() => setFailedUrl(logoUrl)}
        className={cx("image-outline shrink-0 bg-surface object-contain", className)}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const text = profile.logo.kind === "monogram" ? profile.logo.text : initials(profile.name);
  return (
    <span
      role="img"
      aria-label={`${profile.name} logo`}
      className={cx("inline-flex shrink-0 items-center justify-center font-semibold tracking-[-0.02em]", className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: Math.round(size * (text.length > 2 ? 0.32 : 0.4)),
        backgroundColor: profile.colors.brand,
        color: profile.colors.brandForeground,
      }}
    >
      {text}
    </span>
  );
}
