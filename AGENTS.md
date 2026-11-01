# diepen-demos

Three open-source demos that prove diepen.ai's offer (the one task that eats a team's week, automated with AI and live in 14 days, at a fixed quote) before there are client case studies.
Each demo is a case study page, a 60 to 90 second LinkedIn screen video and a live demo on sales calls in the prospect's own brand.

## Project facts

- Direction: `docs/direction.md`. The goal, the users and what this project does not build. Read it before you plan.
- Features: `docs/features/`. One file per demo: the film script, the live flows, the acceptance checks and the feature rows. A change to what a user can do updates it in the same commit.
- Decisions: `docs/decisions.md`. If the docs do not answer a question, add it there with your best default, continue with the default, and say so in your report.
- Brief: `docs/brief.md`. The build brief this repo was made from.
- Tracker: none. Work is tracked in this repo's docs and commits.
- Verify: `pnpm verify`. Start with `--help`. `VERIFY_APP=inbox|documents|meetings` picks the app.
- Mode: normal

## Commands

| Command | Does |
| --- | --- |
| `pnpm dev:inbox` | Inbox autopilot on http://localhost:3101 |
| `pnpm dev:documents` | Document chaser on http://localhost:3102 |
| `pnpm dev:meetings` | Call to close on http://localhost:3103 |
| `pnpm check` | Lint, types, unit tests, feature maps, suppressions, then e2e with the mock provider. Before commits |
| `pnpm verify` | Prove a change in the running app. `VERIFY_APP=documents pnpm verify up` |

e2e starts its own dev server per app on a port derived from the checkout path (4100 to 4899), so parallel worktrees never collide. It builds into `.next-e2e/` and forces `AI_PROVIDER=mock`.

## Where code goes

The repo is open source and follows an onion architecture. Dependencies point inwards only.

Inside each app (`apps/inbox`, `apps/documents`, `apps/meetings`):

| Folder | Layer | Holds | May import |
| --- | --- | --- | --- |
| `domain/` | Core | Types and pure rules of this demo: conversation status, checklist state, CRM record | Other domain modules, zod, `@diepen/voice/profile` |
| `application/` | Use cases | One file per use case, for example `answer-inquiry.ts`. Ports it needs are parameters or interfaces in `application/ports/` | domain, `@diepen/voice`, the port types `@diepen/ai/provider` and `@diepen/ai/models` |
| `infrastructure/` | Adapters | Port implementations (Claude, Google Document AI, in-process scheduler) and `container.ts`, the one place that picks and wires them | Everything except ui and app |
| `ui/` | Presentation | This demo's React components. Talks to the server only through route handlers | domain, film, `@diepen/ui`, `@diepen/voice`, `@diepen/ai/text-stream-client` |
| `film/` | Presentation | The film script and its recorded fixtures | domain, `@diepen/ui`, `@diepen/voice/profile` |
| `app/` | Delivery | Next.js pages and route handlers. A route validates input, runs the guards, calls one use case through the container, and returns | Everything |

Shared packages:

| Folder | Holds | May import |
| --- | --- | --- |
| `packages/ai` | The `AiProvider` port (`provider.ts`), its Claude and mock adapters, the provider factory, cost guards, streaming helpers | Nothing in this repo |
| `packages/voice` | `CompanyProfile` (domain), the fictional presets, `buildSystemPrompt` and one file per AI task in `tasks/`, brand extraction and its HTTP handler | `@diepen/ai` |
| `packages/ui` | Design tokens, film engine and film components, channel mockups, brand provider, "Make it yours" panel, demo shell | `@diepen/voice` |
| `skills/company-voice` | The Claude skill that writes a `CompanyProfile` for client work | |

`eslint.config.mjs` enforces both tables with `no-restricted-imports`. Only `packages/ai` imports `@anthropic-ai/sdk`.

Packages have no index file. Import a module by its path: `@diepen/ui/film/keynote-stage`, `@diepen/voice/profile`. Public modules of `@diepen/ui` are `.tsx`, of `ai` and `voice` are `.ts`. `docs/packages.md` lists every public module.

Code for one demo stays in its app. It moves into a package when a second demo needs it, not before.

## Rules

- Clean code for readers outside the company: names say what a thing is, one concept per module, comments say why, no dead code, no secrets.
- Every AI call goes through `@diepen/ai` and every system prompt through `buildSystemPrompt` in `@diepen/voice/prompt`. Never a prompt string in an app.
- Film mode runs from recorded fixtures with no key and no network. Live mode calls Claude; with no `ANTHROPIC_API_KEY` it uses the mock provider and says so on screen.
- When a cost guard trips, the route answers 429 with `{ fallback: "film" }` and the app sends the visitor to the film with a short note (`useFilmFallback` from `@diepen/ui/shell/film-fallback`). When the model fails, the route answers 503 `unavailable` and the visitor stays to try again. `isGuardTrip` from `@diepen/ai/text-stream-client` tells the two apart.
- A route reads its body with `readBodyText` or `readBodyBytes` from `@diepen/ai/request-body`, under a byte cap. Lint refuses `request.json()`, `request.text()` and `request.formData()` in routes.
- Tests never call the real API. `AI_PROVIDER=mock` is set in every vitest and Playwright config.
- Fixtures and presets hold fictional companies and people only, and the screen says they are fictional.
- Copy is English, direct, and has no em or en dashes. Never state a client result: the demos are demos.
- The company profile lives in the URL or local storage, never on a server.
- A mistake that happens twice gets a lint rule or a type, not a reminder in this file.
- Deploys go to Vercel, one project per app. Long-running or scheduled work goes behind a port; Trigger.dev is the adapter for durable jobs, Google Cloud for heavy compute such as Document AI OCR. See `docs/decisions.md`.
- Agents never read env files. `.env.example` lists the variable names.

## Known traps

- `next dev` and e2e share an app folder. e2e uses `NEXT_DIST_DIR=.next-e2e` so the two never fight over `.next`.
- e2e runs on `next dev`, which compiles a route on its first request. Each app's `e2e/support/warm-up.ts` requests every page and API route once before the tests start, so a loaded machine does not time out first page loads. A new route goes into that list.
- TypeScript stays on 6.0: typescript-eslint supports TypeScript below 6.1.
- In-memory rate limits and the daily cap count per server instance. See `docs/decisions.md`.
- The per-IP rate limit trusts the first `x-forwarded-for` entry. That is safe on Vercel, which overwrites the header; behind another proxy a visitor could set it and pass the limit.
