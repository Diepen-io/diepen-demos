# diepen-demos

Three open-source demos that prove diepen.ai's offer (one AI automation for a small business, live in 14 days, fixed price) before there are client case studies.
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

e2e starts its own dev server per app on ports 3201 to 3203, builds into `.next-e2e/` and forces `AI_PROVIDER=mock`.

## Where code goes

The repo is open source and follows an onion architecture. Dependencies point inwards only.

Inside each app (`apps/inbox`, `apps/documents`, `apps/meetings`):

| Folder | Layer | Holds | May import |
| --- | --- | --- | --- |
| `domain/` | Core | Types and pure rules of this demo: conversation status, checklist state, CRM record | Other domain modules, zod, `@diepen/voice/profile` |
| `application/` | Use cases | One file per use case, for example `answer-inquiry.ts`. Ports it needs are parameters or interfaces in `application/ports/` | domain, `@diepen/voice`, the port types `@diepen/ai/provider` and `@diepen/ai/models` |
| `infrastructure/` | Adapters | Port implementations (Claude, Google Document AI, in-process scheduler) and `container.ts`, the one place that picks and wires them | Everything except ui and app |
| `ui/` | Presentation | This demo's React components. Talks to the server only through route handlers | domain, `@diepen/ui`, `@diepen/voice`, `@diepen/ai/text-stream-client` |
| `film/` | Presentation | The film script and its recorded fixtures | domain, `@diepen/ui` |
| `app/` | Delivery | Next.js pages and route handlers. A route validates input, runs the guards, calls one use case through the container, and returns | Everything |

Shared packages:

| Folder | Holds | May import |
| --- | --- | --- |
| `packages/ai` | The `AiProvider` port (`provider.ts`), its Claude and mock adapters, the provider factory, cost guards, streaming helpers | Nothing in this repo |
| `packages/voice` | `CompanyProfile` (domain), the fictional presets, `buildSystemPrompt` and one file per AI task in `tasks/`, brand extraction and its HTTP handler | `@diepen/ai` |
| `packages/ui` | Design tokens, film engine and film components, channel mockups, brand provider, "Make it yours" panel, demo shell | `@diepen/voice` |
| `skills/company-voice` | The Claude skill that writes a `CompanyProfile` for client work | |

`eslint.config.mjs` enforces both tables with `no-restricted-imports`. Only `packages/ai` imports `@anthropic-ai/sdk`.

Packages have no index file. Import a module by its path: `@diepen/ui/film/film-stage`, `@diepen/voice/profile`. Public modules of `@diepen/ui` are `.tsx`, of `ai` and `voice` are `.ts`. `docs/packages.md` lists every public module.

Code for one demo stays in its app. It moves into a package when a second demo needs it, not before.

## Rules

- Clean code for readers outside the company: names say what a thing is, one concept per module, comments say why, no dead code, no secrets.
- Every AI call goes through `@diepen/ai` and every system prompt through `buildSystemPrompt` in `@diepen/voice/prompt`. Never a prompt string in an app.
- Film mode runs from recorded fixtures with no key and no network. Live mode calls Claude; with no `ANTHROPIC_API_KEY` it uses the mock provider and says so on screen.
- When a cost guard trips, the route answers 429 with `{ fallback: "film" }` and the app shows the film with a short note.
- Tests never call the real API. `AI_PROVIDER=mock` is set in every vitest and Playwright config.
- Fixtures and presets hold fictional companies and people only, and the screen says they are fictional.
- Copy is English, direct, and has no em or en dashes. Never state a client result: the demos are demos.
- The company profile lives in the URL or local storage, never on a server.
- A mistake that happens twice gets a lint rule or a type, not a reminder in this file.
- Deploys go to Vercel, one project per app. Long-running or scheduled work goes behind a port; Trigger.dev is the adapter for durable jobs, Google Cloud for heavy compute such as Document AI OCR. See `docs/decisions.md`.
- Agents never read env files. `.env.example` lists the variable names.

## Known traps

- `next dev` and e2e share an app folder. e2e uses `NEXT_DIST_DIR=.next-e2e` so the two never fight over `.next`.
- TypeScript stays on 6.0: typescript-eslint supports TypeScript below 6.1.
- In-memory rate limits and the daily cap count per server instance. See `docs/decisions.md`.
