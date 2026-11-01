import { basename } from "node:path";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";

const indexFile = /^index\.(ts|tsx|js|jsx|mts|cts)$/;

const agent = {
  rules: {
    "no-index-files": {
      meta: {
        type: "problem",
        messages: {
          index: "Name the file after what it holds. An index file hides where code lives.",
        },
        schema: [],
      },
      create: (context) => ({
        Program: (node) => {
          if (indexFile.test(basename(context.filename))) {
            context.report({ node, messageId: "index" });
          }
        },
      }),
    },
  },
};

/**
 * Rules that stop the shortcuts agents copy. Spread it after the stack's
 * TypeScript config, which registers the @typescript-eslint plugin.
 */
export function agentGuardrails({ root, files = ["**/*.{ts,tsx,mts,cts}"] }) {
  return [
    comments.recommended,
    { linterOptions: { reportUnusedDisableDirectives: "error" } },
    {
      files,
      plugins: { agent },
      languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: root } },
      rules: {
        "agent/no-index-files": "error",
        "@eslint-community/eslint-comments/require-description": "error",
        "@eslint-community/eslint-comments/no-unlimited-disable": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/ban-ts-comment": [
          "error",
          { "ts-expect-error": "allow-with-description", minimumDescriptionLength: 10 },
        ],
        "@typescript-eslint/no-floating-promises": "error",
        // React awaits nothing from an onClick, and an async handler there is the normal pattern.
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: { attributes: false } },
        ],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "no-warning-comments": [
          "error",
          { terms: ["todo", "fixme", "hack", "workaround", "xxx"], location: "start" },
        ],
        "no-console": ["error", { allow: ["warn", "error"] }],
        "max-lines": ["warn", { max: 200, skipBlankLines: true, skipComments: true }],
      },
    },
    {
      files: ["scripts/**", "**/*.config.{ts,mts,mjs,js}"],
      rules: { "no-console": "off" },
    },
  ];
}
