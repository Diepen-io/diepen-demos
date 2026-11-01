import type { NextConfig } from "next";

const config: NextConfig = {
  // e2e runs its own dev server next to a developer's, so it builds into its own folder.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // The films are screen-recorded from the dev server too; the dev badge must not show in them.
  devIndicators: false,
  transpilePackages: ["@diepen/ui", "@diepen/ai", "@diepen/voice"],
};

export default config;
