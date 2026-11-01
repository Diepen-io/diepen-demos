import type { NextConfig } from "next";

const config: NextConfig = {
  // e2e runs its own dev server next to a developer's, so it builds into its own folder.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["@diepen/ui", "@diepen/ai", "@diepen/voice"],
};

export default config;
