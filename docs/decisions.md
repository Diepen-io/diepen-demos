# Decisions

The brief tells agents to write an unanswered question here with a default, continue with the default, and report it.
Leander confirms or changes each open row.

## Open

| Id | Question | Default we use | Blocks | Asked |
| --- | --- | --- | --- | --- |
| D1 | Where do the demos live? | `inbox.demo.diepen.ai`, `documents.demo.diepen.ai`, `meetings.demo.diepen.ai`, used as the live links in the case studies | Case study links | 2026-11-01 |
| D2 | Which GitHub repo do the case studies link to? | `https://github.com/Diepen-io/diepen-demos` | Case study links, README | 2026-11-01 |
| D3 | Rate limit and daily cap count in server memory, so each Vercel instance keeps its own count. Is that enough? | In memory. Move to Upstash Redis if the Anthropic bill shows abuse | Cost | 2026-11-01 |
| D5 | Which OCR do the document checks use? | An `OcrService` port with two adapters. Claude reads PDFs and images directly by default (one key). Google Document AI runs when `OCR_PROVIDER=google-document-ai` and its Google Cloud settings are set | Document chaser | 2026-11-01 |
| D6 | Where do long-running and scheduled jobs run? | A `JobScheduler` port. The demos use an in-process adapter because their film and live modes compress time. Client builds use Trigger.dev (durable waits of days, retries, TypeScript tasks next to a Vercel app); Google Cloud stays for heavy compute | Document chaser reminders, client builds | 2026-11-01 |
| I1 | The profile has no structured opening hours. What does the inbox calendar use? | The preset's hours for every profile (Mon to Thu 08:00 to 18:00, Fri 08:00 to 14:00); the "before" reply time counts to 08:00 | Inbox calendar, end number | 2026-11-01 |
| I2 | Does "Make it yours" rewrite the film's replies with Claude? | No. The film fills names, services and prices from the profile; the visitor's own voice shows in live mode | Inbox film | 2026-11-01, replaced by F1 |
| I3 | What happens after a handover in live mode? | The AI stops replying in that conversation; "Start over" clears it | Inbox live mode | 2026-11-01 |
| I4 | Where do live threads and bookings live? | Page memory. A reload or a new profile clears them | Inbox live mode | 2026-11-01 |
| I5 | How is the film recorded without controls? | `?record=1` hides the shell chrome and the film controls | All films | 2026-11-01 |
| M1 | With a visitor's profile, what changes in the meetings film? | The landlord story stays; the seller's company, owner, logo, colours, price, sign-off and meeting length come from the profile | Meetings film | 2026-11-01, replaced by F1 |
| M2 | Where does the "before" number of the meetings film come from? | "2 days", stated as this fictional scenario's manual routine | Meetings end card | 2026-11-01 |
| M3 | Browser speech recognition sends audio to the browser vendor's service. How do we say it? | One line under Record: "Your browser's speech service turns your voice into text." | Meetings live mode | 2026-11-01 |
| M4 | Live transcript limits | 30,000 characters, 20 words minimum, 400 turns, 10 minutes of recording. Zoom, Teams and Otter export formats wait for a later version | Meetings live mode | 2026-11-01 |
| M5 | The presets' sign-off names the AI assistant ("Tom from Brickfern Property Management"), and the meetings film's prospect is also called Tom. Who signs the owner's follow-up email? | The first line of the sign-off and the owner's name, through the `{signOffGreeting}` token: "Best regards,\nJonas Albers" | Meetings film and keyless live email | 2026-11-01 |
| S6 | One URL parameter for a tripped cost guard | `?fallback=limit` in every app; the shell shows the note | All apps | 2026-11-01 |
| D7 | How many output tokens may one request use? Thinking tokens count too | 4000 (`AI_MAX_OUTPUT_TOKENS`). At the daily cap of 300 Sonnet requests that is at most about 12 USD a day | Cost, document checks, call outputs | 2026-11-01 |
| N1 | Who writes the document chaser's follow-up and reminder emails? | A fixed template filled from the profile, not Claude. A voice task can come later | Documents live mode | 2026-11-01 |
| N2 | Does "Make it yours" change which documents the chaser requests? | No. The six tax-return documents stay for every industry | Documents film | 2026-11-01, replaced by F1 |
| N3 | Where does the documents end number come from? | An example calculation for a fictional firm: 40 returns a month, 3 chases each, 6 minutes per chase, against 1.5 minutes per return to read the summary. 12 hours before, 1 after | Documents end card | 2026-11-01 |
| F1 | What does "Make it yours" change in the films? | Nothing inside the film. Each film always tells its own fictional company's story, because each story is industry-specific: swapping in another company's services gave nonsense (a dentist selling check-ups to a landlord). "Make it yours" puts the visitor's company fully into live mode; applying a profile on the film page opens live mode. Replaces I2, M1 and N2 | All films, sales calls | 2026-11-01 |
| D4 | What does live mode do without `ANTHROPIC_API_KEY`? | The mock provider answers and the screen says "Demo answers. No API key is set." | Local testing | 2026-11-01 |

## Decided

| Id | Decision | Why | Date |
| --- | --- | --- | --- |
| S1 | TypeScript 6.0, not 7 | typescript-eslint supports TypeScript below 6.1 | 2026-11-01 |
| S2 | `/` is the film, `/live` is live mode, in every app | One URL to record, one to demo on a call | 2026-11-01 |
| S4 | Onion architecture in every app: domain, application, infrastructure, ui and app, enforced by lint | Leander asked for clean, layered code because the repo is open source | 2026-11-01 |
| S5 | Deploy target is Vercel | Leander, 2026-11-01 | 2026-11-01 |
| S3 | The company profile travels in the `?brand=` URL parameter (base64url JSON) and local storage | The brief forbids server storage; a URL can be sent to a prospect | 2026-11-01 |
