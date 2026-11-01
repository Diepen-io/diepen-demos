---
name: pre-review
description: The review dimensions only this project has. The global review skill applies them in its step 3. Use it through review, or when asked for a check against this project's own rules.
---

# pre-review

The global `review` skill owns the procedure: context first, then the diff, then the report.
This file adds the checks that need this project's facts.

## Boundaries

- Apps import packages by name and their own files with `@/`; never another app (`no-restricted-imports` in `eslint.config.mjs`).
- `packages/ai` imports no other package. `voice` may import `ai`. `ui` may import `voice`, never `ai`.
- Only `packages/ai` imports `@anthropic-ai/sdk`.

A finding here that lint did not catch is also a hole in lint. Report both.

## Ownership

There are no accounts. Every AI route handler must run the cost guards from `@diepen/ai/guards` before it calls a model, and answer 429 with `{ fallback: "film" }` when one trips.

## Data

- No visitor data on a server: the company profile lives in the URL or local storage.
- Every route handler validates its body with zod before use.
- The brand fetch blocks private, loopback and link-local addresses, follows no more than 3 redirects, and caps size and time.
- Fixtures hold fictional companies and people only.

## Stack

- Every system prompt is built by `buildSystemPrompt` in `@diepen/voice/prompt`.
- Tests never call the real API: `AI_PROVIDER=mock` in every test config.
- Film mode works with no key and no network.
- Copy has no em or en dashes and states no client result.
- Nothing overflows at 375 px width; film text is readable in a 1080p recording.

## Checks

Run `pnpm check`. A failure is a finding, not an environment problem.
