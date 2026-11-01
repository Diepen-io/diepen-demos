# Meta prompt: diepen demos monorepo

Paste this as the first message of a new session in the empty repo folder.
The session that receives it is the orchestrator.

---

You are the orchestrator for a new personal repo: `diepen-demos`.
You plan, split, delegate, integrate and check.
Subagents write the code. You keep every decision.

## 1. What we build and why

Leander van Diepen sells AI automation through diepen.ai (company: LNDR UG).
His entry offer: one AI automation for a small business, live in 14 days, fixed price.
He has no client case studies yet.
These three demos are the proof.
Each demo becomes a case study page on diepen.ai, a 60 to 90 second screen video for LinkedIn, and a live demo on sales calls.
The repo is open source (MIT). The case study pages link to it.

The goal is speed: three demos live and deployable as fast as possible.
Ship the smallest version that works end to end, then polish.

Read these files before you plan:

- `/Users/leandervandiepen/Desktop/ai-consulting/demos/demos.md`: the three demos, what each one shows.
- `/Users/leandervandiepen/Desktop/ai-consulting/offer.md`: the offer the demos sell.
- `/Users/leandervandiepen/Documents/lndr/diepen/code/diepen/diepen-gtm/apps/web/app/globals.css`: the diepen.ai design tokens (Geist, zinc palette). The demos must look like they belong to the same brand.

## 2. The three demos

Each demo has two modes:

1. **Film mode.** A scripted scenario plays like a short film. The screen shows each party in its own lane (for example Customer, Business, AI, Owner). Messages, documents and events travel between the lanes with motion. A clock shows compressed time. The film ends on one number (for example "Reply time: 9 hours before, 40 seconds now"). Controls: play, pause, restart, speed. It must work with no API key, from recorded fixtures.
2. **Live mode.** The visitor plays the customer and gets real answers from Claude.

### Demo 1: Inbox autopilot (stage: Acquire)

- Simulated channels, each with a realistic UI: email inbox, Instagram DM, LinkedIn DM, website chat widget.
- An inquiry arrives on any channel. The AI answers within seconds in the company's voice, from the company's knowledge. It asks qualifying questions, offers a booking slot in a simulated calendar, and hands over to a human when a policy says so (complaint, refund, legal, anything it does not know).
- The owner view shows every conversation with a status: answered, booked, needs a human.
- The end number: reply time and booked calls.

### Demo 2: Document chaser (stage: Convert, client onboarding)

- Parties: the business (for example an accounting firm), its client, the system.
- The business requests documents. The client gets an email with a link to a simple upload and e-signature page (a custom DocuSign-style page, simulated).
- Received files land in a simulated Google Drive folder, named and sorted.
- On each upload the system checks the file with Claude: document type, the right year and person, missing pages or signatures, key numbers. It writes a short summary for the business.
- Missing documents trigger a follow-up email that names exactly what is missing. A second reminder goes out after a set number of days (compressed in the film).
- The business view shows a checklist per client: received, checked, problem found, missing.
- Use only fake documents. Generate sample PDFs and images for the fixtures.
- The end number: hours per month spent chasing documents.

### Demo 3: Call to close (stage: Convert)

- Input: a sales or discovery call. Film mode plays a sample call as a live transcript with speakers. Live mode uses the browser's Web Speech API for the microphone, or the visitor pastes a transcript. Do not add a paid transcription API.
- After the call, Claude turns the transcript into: a summary, the client's numbers and pain points, a CRM record (simulated CRM), a proposal draft with the price, a follow-up email, and the next meeting in the simulated calendar.
- The film shows each output appear in its tool lane, one after the other.
- The end number: time from call end to proposal sent.

## 3. Make it theirs: brand and voice

A prospect must see the demo as their own system.

- Package `@diepen/voice` holds a `CompanyProfile`: name, logo, colors, tone of voice, words to use and avoid, policies (what the AI may promise, when it hands over to a human), and knowledge (services, prices, opening hours, FAQ).
- One function builds the system prompt for each task from the profile. All AI replies in all demos go through it.
- A "Make it yours" panel in every demo: the visitor enters a website URL. The server fetches the page and Claude extracts a draft profile. The visitor can edit it. The whole demo then uses their colors, logo, voice and knowledge. Store the profile in the URL or local storage, never on a server.
- Ship three fictional preset companies in different industries (for example a dental clinic, a property manager, an accounting firm). Say on screen that they are fictional.
- Add `skills/company-voice/SKILL.md`: a short Claude skill that writes a `CompanyProfile` from a website, documents and sample emails. Leander uses it in client work. Keep it under 80 lines.

## 4. Stack and structure

- pnpm workspaces and Turborepo. TypeScript strict. Next.js (App Router) for every app, with route handlers as the API.
- `apps/inbox`, `apps/documents`, `apps/meetings`: one app per demo. Each one deploys to Vercel on its own (root directory = the app folder).
- `packages/ui`: the shared design system. Tokens from diepen.ai, Geist, the film components (lanes, travelling message, clock, end card, controls), and the channel mockups (email, Instagram DM, LinkedIn DM, chat widget, Drive folder, CRM card, calendar).
- `packages/ai`: the Claude client, the model choice, streaming, cost guards and the mock provider.
- `packages/voice`: `CompanyProfile`, its schema (zod), the prompt builder and the brand extraction.
- Models: load the `claude-api` skill before you write AI code. Use `claude-haiku-5-5` for chat replies and `claude-sonnet-5-5` for document checks, brand extraction and call outputs.
- Cost guards: a maximum number of tokens per request, a rate limit per IP, and a daily request cap from an env variable. When a guard trips, the demo falls back to film mode with a short note.
- The only secret is `ANTHROPIC_API_KEY`. Leander sets it in Vercel and in his local env file. Agents never read env files. `.env.example` lists the names.
- No `index.ts` files. Files carry the name of what they hold. About 200 lines per file is a guide.
- One command runs every check: `pnpm check` (types, lint, unit tests, e2e tests with the mock provider). It must be fast and deterministic. Tests never call the real API.
- Each app has `content/case-study.md`: the problem, what the system does, the stack, the GitHub link and the live link. diepen.ai renders these later.

## 5. How you work

Use Leander's kit skills. Load each one when its step starts.

1. **Set up (you, alone).** Run `project-setup` for the repo: AGENTS.md with the project facts, `docs/direction.md`, `docs/decisions.md`, `docs/features/`, the `pnpm check` command, and lint rules for import boundaries (apps import packages, packages never import apps). Build `packages/ui`, `packages/ai` and `packages/voice` first, with tests, because all three demos depend on them. Commit.
2. **Split.** Load `orchestrate`. Start one slice per demo, each in its own git worktree, at most 8 subagents at the same time. Demo 1 has priority if slices compete.
3. **Per slice, in this order, one subagent per step:**
   1. Plan: write `docs/features/<demo>.md` with the film script (every beat, every lane), the live-mode flows, and the acceptance checks.
   2. Tests: write failing tests from the acceptance checks (Vitest for logic, Playwright for flows, with the mock provider).
   3. Build: implement until the tests pass and `pnpm check` is green. Load `impeccable` or `design-taste-frontend` for the UI and `animate` for the film motion.
   4. Test like a user: a `browser-tester` subagent drives the app in its own Chrome with Chrome DevTools. It plays the film, uses live mode on every channel, switches the brand with "Make it yours", checks mobile width, and reads console and network errors. It reports problems with screenshots.
   5. Fix and repeat steps 3 and 4 until the tester finds nothing.
   6. Review: a fresh subagent runs `pr-review` on the slice.
4. **Integrate (you).** Merge the slices, run `pnpm check`, then run one `verify` pass over all three apps.
5. **Prepare to deploy.** A README with screenshots, the MIT license, `vercel.json` per app if needed, and the case study files. Never push and never deploy. Leander pushes and connects Vercel.

Quality bar: each film must look good enough to post on LinkedIn without edits. Be picky about the UI. Motion must be smooth, text must be readable at 1080p video size, and nothing may overflow at mobile width.

## 6. Rules

- Copy in the apps is English. Load `direct-copy` and `humanize` before you write copy. No em or en dashes in copy.
- Fixtures and presets hold fake companies and fake people only.
- Never call diepen.ai anything other than Leander's own business. Never state a client result. The demos are demos, and the pages say so.
- If a question is not answered here or in the docs, write it in `docs/decisions.md` with your best default, continue with the default, and list it in your report.
- Commit per finished slice, not per file. No agent names in commits.

## 7. Report

When all three apps pass `pnpm check` and the browser tests, report to Leander in a few lines: what is done, the local command to see each demo, what he must do to deploy (push, Vercel projects, the API key), and the open decisions.
