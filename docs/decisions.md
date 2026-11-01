# Decisions

The brief tells agents to write an unanswered question here with a default, continue with the default, and report it.
Leander confirms or changes each open row.

## Open

| Id | Question | Default we use | Blocks | Asked |
| --- | --- | --- | --- | --- |
| D1 | Where do the demos live? | `inbox.demo.diepen.ai`, `documents.demo.diepen.ai`, `meetings.demo.diepen.ai`, used as the live links in the case studies | Case study links | 2026-11-01 |
| D2 | Which GitHub repo do the case studies link to? | `https://github.com/Diepen-io/diepen-demos` | Case study links, README | 2026-11-01 |
| D3 | Rate limit and daily cap count in server memory, so each Vercel instance keeps its own count. Is that enough? | In memory. Move to Upstash Redis if the Anthropic bill shows abuse | Cost | 2026-11-01 |
| D4 | What does live mode do without `ANTHROPIC_API_KEY`? | The mock provider answers and the screen says "Demo answers, no API key set" | Local testing | 2026-11-01 |

## Decided

| Id | Decision | Why | Date |
| --- | --- | --- | --- |
| S1 | TypeScript 6.0, not 7 | typescript-eslint supports TypeScript below 6.1 | 2026-11-01 |
| S2 | `/` is the film, `/live` is live mode, in every app | One URL to record, one to demo on a call | 2026-11-01 |
| S3 | The company profile travels in the `?brand=` URL parameter (base64url JSON) and local storage | The brief forbids server storage; a URL can be sent to a prospect | 2026-11-01 |
