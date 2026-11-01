import type { NextConfig } from "next";

const config: NextConfig = {
  // e2e runs its own dev server next to a developer's, so it builds into its own folder.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // The film is recorded from the dev server; the dev badge must not show in the video.
  devIndicators: false,
  transpilePackages: ["@diepen/ui", "@diepen/ai", "@diepen/voice"],
  // Browsers ask for /favicon.ico whatever the page links; the app icon answers it.
  rewrites: () => Promise.resolve([{ source: "/favicon.ico", destination: "/icon.svg" }]),
};

export default config;
