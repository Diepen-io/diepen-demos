# Features

What each demo does today and what is planned. An id never changes.
Each demo has one file. It holds the film script, the live-mode flows, the acceptance checks and the feature rows.
`pnpm verify:map` fails when a demo's rows and its app's page routes disagree.

## Baseline

No accounts: every visitor is `anon`. Film mode needs no key. e2e and `pnpm verify flow` run the mock provider.

## Index

| Demo | File | App | Port |
| --- | --- | --- | --- |
| Inbox autopilot | `inbox.md` | `apps/inbox` | 3101 |
| Document chaser | `documents.md` | `apps/documents` | 3102 |
| Call to close | `meetings.md` | `apps/meetings` | 3103 |

## Sweep order

`inbox.md`, `documents.md`, `meetings.md`.
