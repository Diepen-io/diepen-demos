import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import { agentGuardrails } from "./lint/agent-guardrails.mjs";

/**
 * Onion architecture. Dependencies point inwards only:
 *
 *   domain          pure types and rules. No I/O, no React, no framework, no adapters
 *   application     use cases. Get their ports (LanguageModel, OcrService, JobScheduler) injected
 *   infrastructure  adapters for the ports, and the one composition root that wires them
 *   ui, app         React components and Next.js routes. Routes stay thin and call the container
 *
 * Where code goes, as lint rules:
 *
 *   apps/<demo>      one Next.js app per demo. Imports packages by name, never another app
 *   packages/ui      design system and film components. May use @diepen/voice types
 *   packages/voice   CompanyProfile, prompt builder, brand extraction. May use @diepen/ai
 *   packages/ai      the Claude client, guards and the mock provider. Imports no other package
 *
 * Only packages/ai talks to Anthropic, so cost guards and the mock provider cannot be skipped.
 */
const noApps = {
  group: ["**/apps/**", "@diepen/inbox", "@diepen/documents", "@diepen/meetings"],
  message: "Packages never import apps. Move the shared code into a package.",
};
const noRelativePackages = {
  group: ["**/packages/**"],
  message: "Import a package by its name (@diepen/ui, @diepen/ai, @diepen/voice).",
};
const anthropicOnlyInAi = {
  group: ["@anthropic-ai/*"],
  message: "Call Claude through @diepen/ai, which holds the guards and the mock provider.",
};

const appScope = {
  group: ["../*", "../**", "**/apps/**"],
  message: "Import inside an app with the @/ alias. An app never imports another app.",
};

const restrict = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/.next-*/**",
    "**/.turbo/**",
    "**/next-env.d.ts",
    "**/playwright-report/**",
    "**/test-results/**",
    ".verify/**",
  ]),
  js.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
  },
  ...agentGuardrails({ root: import.meta.dirname }),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["apps/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // App Router only. The rule looks for a pages/ folder that does not exist.
      "@next/next/no-html-link-for-pages": "off",
      ...restrict(appScope, noRelativePackages, anthropicOnlyInAi),
    },
  },
  {
    files: ["apps/*/domain/**/*.{ts,tsx}"],
    rules: restrict(appScope, noRelativePackages, anthropicOnlyInAi, {
      group: [
        "@/application/**", "@/infrastructure/**", "@/ui/**", "@/app/**", "@/film/**",
        "react", "react-dom", "next", "next/**", "@diepen/ai", "@diepen/ai/*", "@diepen/ui", "@diepen/ui/*",
        "@diepen/voice/*", "!@diepen/voice/profile",
      ],
      message: "domain is the core. It imports only other domain modules, zod and @diepen/voice/profile.",
    }),
  },
  {
    files: ["apps/*/application/**/*.{ts,tsx}"],
    rules: restrict(appScope, noRelativePackages, anthropicOnlyInAi, {
      group: [
        "@/infrastructure/**", "@/ui/**", "@/app/**", "@/film/**",
        "react", "react-dom", "next", "next/**", "@diepen/ui", "@diepen/ui/*",
        "@diepen/ai/*", "!@diepen/ai/provider", "!@diepen/ai/models",
      ],
      message: "A use case depends on ports, not adapters. Take the provider as a parameter; infrastructure/ wires it.",
    }),
  },
  {
    files: ["apps/*/infrastructure/**/*.{ts,tsx}"],
    rules: restrict(appScope, noRelativePackages, anthropicOnlyInAi, {
      group: ["@/ui/**", "@/app/**", "@/film/**", "react", "react-dom"],
      message: "Adapters know nothing about screens or routes.",
    }),
  },
  {
    files: ["apps/*/ui/**/*.{ts,tsx}", "apps/*/film/**/*.{ts,tsx}"],
    rules: restrict(appScope, noRelativePackages, anthropicOnlyInAi, {
      group: ["@/infrastructure/**", "@/application/**", "@/app/**", "@diepen/ai", "@diepen/ai/*", "!@diepen/ai/text-stream-client"],
      message: "UI talks to the server over HTTP through route handlers. It never runs a use case or an adapter.",
    }),
  },
  {
    files: ["packages/ui/**/*.{ts,tsx}"],
    rules: restrict(noApps, noRelativePackages, anthropicOnlyInAi, {
      group: ["@diepen/ai", "@diepen/ai/*"],
      message: "UI never calls the AI. An app route does, and passes the result as props.",
    }),
  },
  {
    files: ["packages/voice/**/*.{ts,tsx}"],
    rules: restrict(noApps, noRelativePackages, anthropicOnlyInAi, {
      group: ["@diepen/ui", "@diepen/ui/*"],
      message: "voice holds data and prompts. It renders nothing.",
    }),
  },
  {
    files: ["packages/ai/**/*.{ts,tsx}"],
    rules: restrict(noApps, noRelativePackages, {
      group: ["@diepen/ui", "@diepen/ui/*", "@diepen/voice", "@diepen/voice/*"],
      message: "ai is the bottom layer. It knows nothing about brands or UI.",
    }),
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/e2e/**", "**/*.config.{ts,mts,mjs}", "scripts/**"],
    rules: { "no-console": "off", "max-lines": "off" },
  },
]);
