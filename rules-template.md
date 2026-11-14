# Rule file template for coding agents

Copy this into `AGENTS.md` (or `CLAUDE.md`) at the root of your repo.
Every agent reads it before it touches the code.
Replace the parts in angle brackets, and delete what does not fit your project.

## Project facts

- What it is: <one sentence on what the product does and for whom>.
- Check command: `<pnpm check>`. It runs lint, types and every test. Run it before you call work done.
- Start command: `<pnpm dev>`, with seed data, so a bug can be reproduced end to end.
- Decisions: `docs/decisions.md`. If the docs do not answer a question, add it there with your best default, and say so in your report.
- Secrets: <where they live>. Never read an env file or a secret store.

## Always

- Done means proven. A change is done when the check command passes and you show proof: a test, a screenshot or a log line.
- Reproduce a bug before you fix it, at the cheapest level that shows it, for example a failing test.
- One way to do each thing in this repo. A second convention next to an existing one is a bug.
- Comments say why, never what.
- Commit when a change is finished and its checks pass: one commit per coherent change.

## Several agents at once

- One owner per file. Two agents never change the same file at the same time.
- Each agent works in its own git worktree, on its own branch.
- The main session plans and reviews. It does not build.
- A fresh agent reviews every change before it is merged.

## A brief to an agent has 4 parts

1. The goal, in one sentence.
2. The files it owns.
3. How it proves the work.
4. What its report contains.

## When I correct an agent

Fix the instance, then stop the class: change the code, then a lint rule or a test, then a line in this file.

## Papercut log

`papercuts.md` holds one line for every time a tool cost us time that the product did not cause: a stale lockfile, a missing env var, a wrong doc.

- Format: `YYYY-MM-DD · project · symptom · fix`.
- Append only. Never rewrite the file.
- Read it first when tooling fails for no visible reason.
- The same symptom three times means: remove the cause, and put the rule where it runs (this file, a script or a CI check).
