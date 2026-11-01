# meetings

Demo 3, "Call to close", in `apps/meetings` on port 3103.
A sales call becomes a summary, the client's numbers and pain points, a CRM record, a proposal at the seller's price, a follow-up email and the next meeting.
This file is the plan: a test writer and a builder need nothing else.

## 1. What it proves

You finish a sales call and the follow-up work is already drafted: summary, CRM record, proposal at your own prices, follow-up email and the next meeting in your calendar.
You read it, press send, and the prospect has your proposal 4 minutes after you hang up.

## 2. Film script

The film runs 80,000 ms (80 seconds) at 1x speed.
It plays the sample call from section 3 as a live transcript, compressed to ten key lines, then each output lands in its tool lane one after the other.
It runs from recorded fixtures with no key and no network.

### Lanes

| Lane id | Label | What it shows | Why it is a lane |
| --- | --- | --- | --- |
| `call` | Call | The live transcript with speaker names and timestamps, then "Call ended 32:10" | The input. The viewer must see the call happen before anything else |
| `ai` | AI | "Waiting for the call to end", then the summary, the numbers and the pain points | The one new thing in the business. Everything else lands in tools the owner already has |
| `crm` | CRM | Two existing deals, then the new record on top with its stage | Each output lands in the tool where the owner would look for it |
| `proposal` | Proposal and email | The proposal document, then the follow-up email below it with the proposal attached | The email carries the proposal, so the two read as one step: send |
| `calendar` | Calendar | The week of 9 to 13 November 2026 with three existing events, then the new meeting | The next meeting is the commitment that keeps the deal moving |

### Tokens

Fixtures and captions hold tokens that `domain/profile-tokens.ts` fills from the active `CompanyProfile` at render time.
That keeps the film true for the default preset and for a visitor's own profile (section 5).

| Token | Value |
| --- | --- |
| `{sellerCompany}` | `profile.name` |
| `{sellerOwner}` | `profile.people.owner.name` |
| `{sellerOwnerFirst}` | First word of `profile.people.owner.name` |
| `{sellerEmail}` | `profile.knowledge.contactEmail` |
| `{serviceName}` | Name of the first service in `profile.knowledge.services` that has a `price` |
| `{servicePrice}` | That service's `price`, verbatim. "Price on request" when no service has a price |
| `{signOff}` | `profile.voice.signOff` |
| `{bookingMinutes}` | `profile.knowledge.bookingMinutes`, a number |

### Beats

Story clock times are wall times on Tuesday 10 November 2026, written as ISO without a zone and shown as written, never converted to the viewer's time zone.
Each beat row is also a clock keyframe; the clock moves linearly between keyframes and holds after the last one.
A travel cell reads `from → to, kind, label`.

| Film ms | Lane | What appears | Travel | Story clock | Caption |
| --- | --- | --- | --- | --- | --- |
| 0 | call | Call header "{sellerOwner}, {sellerCompany} with Tom Becker, landlord" and line [00:00]. AI lane shows "Waiting for the call to end". CRM, proposal and calendar lanes show their existing state | none | 2026-11-10T14:00:00 | A discovery call with a landlord. |
| 3000 | call | Line [00:17], Tom: 14 apartments across three buildings | none | 2026-11-10T14:00:17 | Tom owns 14 apartments and runs them himself. |
| 5800 | call | Line [00:44], Tom: about nine hours a week | none | 2026-11-10T14:00:44 | Nine hours a week on tenants. |
| 8600 | call | Line [01:00], Tom: boiler on a Sunday night, night calls are the worst | none | 2026-11-10T14:01:00 | Night calls are the worst part. |
| 11400 | call | Line [01:17], Tom: 38 days empty on average, six move-outs | none | 2026-11-10T14:01:17 | Apartments stand empty for 38 days. |
| 14200 | call | Line [01:34], {sellerOwnerFirst}: roughly 8,700 in rent not collected | none | 2026-11-10T14:01:34 | About 8,700 in rent lost last year. |
| 17000 | call | Line [01:49], Tom: two late payers, WhatsApp, one spreadsheet | none | 2026-11-10T14:01:49 | Late rent, chased on WhatsApp. |
| 19800 | call | Line [18:13], {sellerOwnerFirst}: "{serviceName} is {servicePrice}." | none | 2026-11-10T14:18:13 | {sellerOwnerFirst} names the price. |
| 22600 | call | Line [24:30], Tom: put it in writing, Anna will want to see it | none | 2026-11-10T14:24:30 | He wants it in writing today. |
| 25400 | call | Line [27:15], {sellerOwnerFirst}: walk the buildings, Friday at ten | none | 2026-11-10T14:27:15 | Next step: Friday at 10:00. |
| 28200 | call | Line [31:46], Tom: the empty days added up | none | 2026-11-10T14:31:46 | 32 minutes in, they wrap up. |
| 31000 | call | Call header switches to "Call ended 32:10" | none | 2026-11-10T14:32:10 | The call ends at 14:32. |
| 33000 | ai | AI lane shows "Reading 36 turns" | call → ai, document, "Transcript, 36 turns" | 2026-11-10T14:32:20 | The AI reads the whole call. |
| 36000 | ai | Summary card | none | 2026-11-10T14:32:40 | Summary first: who, what, when. |
| 40000 | ai | Six number chips and three pain points below the summary | none | 2026-11-10T14:33:00 | His numbers and his three pain points. |
| 44500 | crm | New record "Becker Residential" on top, stage "Proposal drafted" | ai → crm, event, "New deal" | 2026-11-10T14:33:20 | The CRM record fills itself in. |
| 49000 | proposal | Proposal document: title, four scope lines, price, timeline, terms. Status "Draft" | ai → proposal, document, "Proposal draft" | 2026-11-10T14:33:50 | A proposal with his numbers and your price. |
| 54000 | proposal | Follow-up email below the proposal, with a "Proposal.pdf" attachment chip. Status "Draft" | none | 2026-11-10T14:34:20 | The follow-up email, proposal attached. |
| 58500 | calendar | Friday 13 November 10:00, "Walkthrough with Tom Becker", {bookingMinutes} minutes, highlighted | ai → calendar, event, "Fri 10:00" | 2026-11-10T14:34:40 | Friday's walkthrough is in the calendar. |
| 63000 | proposal | Email status "Sent 14:36". Then the CRM stage changes to "Proposal sent" | proposal → crm, event, "Proposal sent" | 2026-11-10T14:36:10 | {sellerOwnerFirst} checks it and sends. 14:36. |
| 67000 | all | End card fades in over the stage and holds until 80000 | none | 2026-11-10T14:36:10 | No caption. The end card carries the text |

The 36 turns in the 33000 beat is the turn count of the sample call; the film reads it from the parsed fixture, never from a literal.

### End card

| Field | Text |
| --- | --- |
| Metric | Call end to proposal sent |
| Before | 2 days |
| After | 4 minutes |
| Supporting line 1 | Summary, CRM record, proposal, follow-up email and next meeting from one call. |
| Supporting line 2 | {sellerOwnerFirst} reads every draft before it goes out. |
| Fictional note | Simulation with a fictional company and landlord. The 2 days is this scenario's manual routine: notes typed up that evening, proposal sent on Thursday. |

"After" is computed by `domain/timing-metric.ts` from the call end beat (14:32:10) and the send beat (14:36:10), so it cannot drift from the clock.
"Before" is a fixed fixture value that belongs to the fictional scenario, and the fictional note says so.

## 3. Fixtures

All people and companies here are fictional.
Tom and Anna Becker, Becker Residential, Elm Street and the existing CRM and calendar entries exist only in this demo.
The seller is whatever profile is active; the default is the meetings preset from `@diepen/voice/presets`.

### Sample call

Stored as `film/fixtures/sample-call.ts`, one exported string in exactly this format, tokens unfilled.
The film and the "Sample call" tab in live mode both use it.
It has 36 lines and runs from 00:00 to 32:10.

```text
[00:00] {sellerOwner}: Hi Tom, it's {sellerOwnerFirst} from {sellerCompany}. Thanks for making the time. Can you hear me okay?
[00:05] Tom Becker: Yes, loud and clear. Sorry, I'm parked outside one of the buildings, so if a door slams, that's why.
[00:12] {sellerOwner}: No problem. I read your message. Tell me what you've got today.
[00:17] Tom Becker: So, 14 apartments across three buildings. Two on Elm Street and one by the station. My wife Anna and I bought the first one in 2015 and it just kept growing.
[00:31] {sellerOwner}: And you run all of them yourselves?
[00:34] Tom Becker: All of it. Rent, repairs, viewings, the lot. That's why I wrote to you, really.
[00:40] {sellerOwner}: How much of your week does it take?
[00:44] Tom Becker: A normal week, about nine hours. Calls, texts, chasing the plumber, chasing rent. And that's next to my actual job.
[00:56] {sellerOwner}: Does it come in bursts or is it spread out?
[01:00] Tom Becker: Bursts. Last month a boiler went on a Sunday night and I was on the phone until midnight. The night calls are the worst part.
[01:12] {sellerOwner}: When someone moves out, how long does the apartment stand empty?
[01:17] Tom Becker: Last year it was 38 days on average. We had six move-outs. I only do viewings on Saturdays, so it drags.
[01:28] {sellerOwner}: What's the average rent?
[01:31] Tom Becker: Around 1,150 a month.
[01:34] {sellerOwner}: So six move-outs at 38 days each. That's roughly 8,700 in rent you didn't collect last year.
[01:42] Tom Becker: Ouch. Yeah, put like that.
[01:46] {sellerOwner}: And the rent itself, does it come in on time?
[01:49] Tom Becker: Mostly. Two tenants are late most months, and I end up chasing them on WhatsApp. Everything lives in one spreadsheet.
[02:03] {sellerOwner}: Is there anything you'd want to keep doing yourself?
[02:07] Tom Becker: Choosing the tenants. Anna and I like to meet them. Everything else I'd hand over tomorrow.
[06:40] {sellerOwner}: Tell me about the buildings. Any big work coming up?
[06:45] Tom Becker: The station building needs new windows in the next couple of years. The Elm Street ones are fine. The boilers are about ten years old.
[11:20] {sellerOwner}: Who does your repairs today?
[11:24] Tom Becker: One plumber I trust and a handyman. The plumber doesn't pick up on weekends, which is half the problem.
[17:05] {sellerOwner}: Here's how we'd run it. Tenants call our line, day or night, and we send the repair. We do viewings within five days of a notice. You get one statement at the start of each month.
[17:31] Tom Becker: And Anna and I would still pick the tenants?
[17:34] {sellerOwner}: You'd meet the final two candidates and choose. We handle everything before and after that.
[18:10] Tom Becker: What does that cost?
[18:13] {sellerOwner}: {serviceName} is {servicePrice}. I'll put the details in writing.
[24:30] Tom Becker: Can you put all of that in writing today? Anna will want to see it with our numbers.
[24:38] {sellerOwner}: You'll have it this afternoon. When would you want to start?
[24:42] Tom Becker: January would be ideal. The first of January, clean start.
[27:15] {sellerOwner}: Then let's walk the three buildings together first. Does Friday at ten work?
[27:20] Tom Becker: Friday at ten works. I'll ask Anna to come too. Send it to tom@becker-residential.example, that's the company, Becker Residential.
[31:46] Tom Becker: This was useful. I hadn't seen how the empty days add up.
[31:58] {sellerOwner}: Talk Friday then, Tom. Thanks.
```

The call ends at 32:10 (story time 14:32:10); the end time is a fixture constant `sampleCallEndsAt = "2026-11-10T14:32:10"`, not a transcript line.
The film shows only the lines at 00:00, 00:17, 00:44, 01:00, 01:17, 01:34, 01:49, 18:13, 24:30, 27:15 and 31:46.

### Recorded outputs for the film

Stored as `film/fixtures/recorded-outputs.ts`, typed as `CallOutputs` from `@diepen/voice/tasks/call-outputs`, tokens unfilled except where a field needs a number.

```ts
export const recordedOutputs = {
  summary:
    "Tom Becker and his wife Anna own 14 apartments in three buildings and manage them themselves, about nine hours a week next to Tom's job. " +
    "Night repair calls are the worst part, apartments stood empty 38 days on average across six move-outs last year, and two tenants pay late most months. " +
    "He wants the proposal in writing today, decides with Anna, and wants to start on 1 January.",
  numbers: [
    { label: "Apartments", value: "14" },
    { label: "Hours a week on tenants", value: "9" },
    { label: "Days empty between tenants", value: "38" },
    { label: "Move-outs last year", value: "6" },
    { label: "Average rent a month", value: "1,150" },
    { label: "Rent lost to empty days last year", value: "about 8,700" },
  ],
  painPoints: [
    "Nine hours a week on tenants, next to a full-time job",
    "Night and weekend repair calls, and the plumber is off on weekends",
    "Apartments stand empty 38 days because viewings only happen on Saturdays",
  ],
  crm: {
    company: "Becker Residential",
    contactName: "Tom Becker",
    contactRole: "Owner",
    email: "tom@becker-residential.example",
    stage: "Proposal drafted",
    dealValue: "{servicePrice}, 14 apartments",
    nextStep: "Send the proposal today. Walk the three buildings on Friday 13 November at 10:00.",
  },
  proposal: {
    title: "{serviceName} for Becker Residential",
    scope: [
      "Tenant calls and repairs for all 14 apartments, nights and weekends included",
      "Viewings within five days of a move-out notice",
      "Rent collection and reminders, with one owner statement a month",
      "Tom and Anna meet the final two candidates for every apartment and choose",
    ],
    price: "{servicePrice}",
    timeline: "Handover in December, {sellerCompany} takes over on 1 January 2027",
    terms: "Valid for 30 days.",
  },
  followUpEmail: {
    subject: "Your proposal from {sellerCompany}",
    body:
      "Hi Tom,\n\n" +
      "Thanks for the call today. What I heard: 14 apartments in three buildings, about nine hours a week of your time, and 38 empty days on average between tenants.\n\n" +
      "The proposal is attached. We take the tenant calls and repairs, nights included, run viewings within five days of a notice, and send you one statement a month. You and Anna still choose every tenant. {serviceName} is {servicePrice}, starting 1 January.\n\n" +
      "Friday at 10:00 is in the calendar to walk the three buildings. Bring Anna if she can make it.\n\n" +
      "{signOff}\n{sellerOwner}",
  },
  nextMeeting: {
    title: "Walkthrough with Tom Becker",
    durationMinutes: 0, // replaced by profile.knowledge.bookingMinutes when the film is built
    start: "2026-11-13T10:00:00",
    agenda: ["Walk all three buildings", "Look at the boilers and the repair history", "Agree the handover date with Anna"],
  },
};
```

### Existing tool state for the film

Shown greyed from beat 0 so the tools look lived in.

| Lane | Entry |
| --- | --- |
| crm | "Hartley Lofts", contact Priya Nair, stage "Proposal sent" |
| crm | "Ines Ortega", private owner, stage "Discovery" |
| calendar | Mon 9 Nov 09:00, "Team check-in", 30 minutes |
| calendar | Wed 11 Nov 15:00, "Viewing, Mill Lane 7", 30 minutes |
| calendar | Thu 12 Nov 11:00, "Owner statements", 60 minutes |

## 4. Live mode (`/live`)

The visitor plays both sides of a call, or brings a real transcript, and gets all six outputs from Claude in the active profile's voice and prices.

### Flow

1. `/live` opens with the shell's Film or Live switch, the active brand, the fictional note when `profile.fictional` is true, and "Demo answers, no API key set" when the container's provider is `mock`.
2. The input column has three tabs: "Record", "Paste" and "Sample call". "Record" is selected when the browser supports speech recognition, otherwise "Paste".
3. Every tab ends in the same editable transcript box with a counter, for example "1,240 / 30,000".
4. The visitor presses "Turn this call into a proposal".
5. The AI lane shows "Reading 12 turns" with the turn count and a seconds counter.
6. When the response arrives, the six outputs appear one after the other, 700 ms apart, in this order: summary, numbers and pain points, CRM record, proposal, follow-up email, next meeting.
7. The email card has "Send to {prospect first name}" and the line "Simulated email."
8. On send, the email shows "Sent HH:MM", the CRM stage changes to "Proposal sent", and a result bar shows "Transcript to proposal sent: 1 min 12 s", measured from the press in step 4 to the send.
9. "Start over" clears the outputs and keeps the transcript.

With `prefers-reduced-motion: reduce`, all six outputs appear at once without motion.

### Record

- The recorder uses the browser's Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`) with `continuous` and `interimResults` on and `lang` from `navigator.language`.
- A two-option toggle "Speaking now: {sellerOwnerFirst} | Prospect" sets the speaker of the next final result, so one person can role-play both sides.
- Interim text shows greyed at the end; each final result becomes one line `[mm:ss] Speaker: text`, with mm:ss measured from "Start".
- Recording stops at 10 minutes, then shows "Recording stops at 10 minutes. Edit the transcript or turn it into a proposal."
- Under the button: "Your browser's speech service turns your voice into text."

Fallbacks, all with the "Paste" and "Sample call" tabs still working:

| Condition | What the visitor sees |
| --- | --- |
| Neither constructor exists (Firefox, Playwright with the API removed) | The Record tab shows "Recording needs Chrome, Edge or Safari. Paste a transcript or load the sample call." and no Start button |
| `error` event `not-allowed` or `service-not-allowed` | "The microphone is blocked. Allow it in the address bar, or paste a transcript." Start becomes "Try again" |
| `error` event `no-speech` | "No speech heard yet. Speak closer to the microphone." Recording continues |
| Any other `error` event | "Recording stopped. Paste a transcript or try again." |

Playwright's Chromium exposes `webkitSpeechRecognition` but has no microphone, so every e2e test either removes the API or installs a fake with `page.addInitScript`.
No test ever touches the real recognizer.

### Paste and sample

- Accepted line formats: `[mm:ss] Name: text`, `[h:mm:ss] Name: text`, `mm:ss Name: text` and `Name: text`.
- A line without a speaker label continues the previous turn. Text before the first label becomes speaker "Speaker".
- Every labelled line is its own turn, even when the same speaker had the line before, so the sample call's 36 lines are 36 turns.
- A speaker label is at most 40 characters and holds no colon; blank lines are ignored.
- "Sample call" fills the box with the sample call from section 3, tokens filled from the active profile.

### Input limits

| Limit | Value | Message |
| --- | --- | --- |
| Minimum | 20 words | "Add a bit more of the call. It needs at least 20 words." |
| Maximum | 30,000 characters, about 35 minutes of speech | "That is over 30,000 characters. Trim it to the part of the call that matters." |
| Turns | 400 after parsing | "That is over 400 turns. Trim it to the part of the call that matters." |
| Recording | 10 minutes | See Record |
| Request body | 100 KB | Route answers 413 |

The button stays disabled while the client-side check fails; the route checks again with the same domain rules.

### One structured call, revealed in sequence

The outputs come from one `generateObject` call with the `call-outputs` schema, model role `analysis` (`claude-sonnet-5-5`), `maxTokens` 2,000, and the UI reveals them in sequence.
Reasons:

- The outputs depend on each other: the email cites the proposal's price, the CRM next step names the meeting, the proposal reuses the numbers. One call keeps them consistent.
- One call counts once against the rate limit and the daily cap. Six streamed calls would cost six times the guard budget for one click.
- The schema validates the whole answer before anything shows, so the visitor never sees a half-written proposal that fails later.
- The film already reveals outputs one by one, so live mode reuses the same reveal and the same lane components.
- The cost is a wait of roughly 10 to 20 seconds before the first output; the AI lane shows "Reading N turns" and a seconds counter during it.

After the call, `process-call.ts` overwrites `proposal.price` with `{servicePrice}` from the profile and `nextMeeting.durationMinutes` with `profile.knowledge.bookingMinutes`, so the proposal never carries a price the profile does not have.
It normalises `crm.stage` to a domain deal stage, defaulting to "Proposal drafted".

### Keyless mock and cost guards

- Without `ANTHROPIC_API_KEY`, or with `AI_PROVIDER=mock`, the container returns the mock provider and the screen shows "Demo answers, no API key set" (decision D4).
- When a guard trips, `/api/outputs` answers 429 `{ fallback: "film" }`. The live page then shows the film with the shell's fallback note, at `/?fallback=limit`.
- When the provider throws or its answer fails the schema, the route answers 502 and the page shows "The draft did not come through. Try again." with a "Try again" button.

### What the mock provider answers

The mock is `application/draft-mock-outputs.ts`, passed as the request's `mock`.
It is pure and deterministic for a given transcript, profile and `localNow`, so e2e can assert on content.

| Field | Rule |
| --- | --- |
| Seller, prospect | Seller is the first speaker whose name contains the profile owner's first name, case-insensitive, else the first speaker. Prospect is the first other speaker, else "Prospect" |
| `summary` | `Call between {seller} of {sellerCompany} and {prospect}, {n} turns. {prospect first name} said: "{first pain point}"` |
| `numbers` | Each number token (`\d{1,3}(,\d{3})*(\.\d+)?`) in the prospect's turns, in order, skipping tokens next to a colon, at most 6. `value` is the token, `label` is the next four words without punctuation, else the previous four |
| `painPoints` | Prospect sentences matching `worst\|problem\|late\|drags\|empty\|hours\|chasing\|stress\|too much\|cost`, case-insensitive, first 3. Else `["The call names no pain point yet."]` |
| `crm` | company `{prospect}'s business`, contactName prospect, contactRole "Prospect", stage "Proposal drafted", dealValue `{servicePrice}`, nextStep "Send the proposal and confirm the next meeting." No email or phone |
| `proposal` | title `{serviceName} for {prospect}`, scope `["{serviceName}: {service description}"]`, price `{servicePrice}`, timeline "Start within two weeks of signing", terms "Valid for 30 days." |
| `followUpEmail` | subject `Your proposal from {sellerCompany}`, body greets the prospect's first name, names the service and price, names the meeting day, ends with `{signOff}` and `{sellerOwner}` |
| `nextMeeting` | title `Next step with {prospect}`, durationMinutes `{bookingMinutes}`, start 10:00 on the first weekday at least two days after `localNow`, agenda `["Questions on the proposal", "Agree the start date", "Next steps"]` |

For the sample call with the default preset, the mock gives prospect "Tom Becker", numbers `["14", "2015", "38", "1,150"]` and pain points `["A normal week, about nine hours.", "Calls, texts, chasing the plumber, chasing rent.", "The night calls are the worst part."]`.

## 5. Make it yours

The visitor enters a website in the shell's "Make it yours" panel; `/api/brand` drafts a profile, the visitor edits it, and it travels in `?brand=` and local storage (decision S3).
The seller is always the active profile's company.

| What | Film (`/`) | Live (`/live`) |
| --- | --- | --- |
| Logo, colours, company name in the header | Yes | Yes |
| Seller name and company in the transcript, CRM, proposal and email | Yes, through the tokens in section 2 | Yes, from the model's answer and the sample call's tokens |
| Proposal service and price | First priced service of the profile, verbatim | Same, enforced after the model answers |
| Email sign-off | `voice.signOff` | `voice.signOff`, plus tone and words to use and avoid through `buildSystemPrompt` |
| Meeting length | `bookingMinutes` | `bookingMinutes`, enforced after the model answers |
| Policies (what the AI may promise) | Fixed fixtures | Through `buildSystemPrompt`, so the proposal and email never promise what `neverPromise` lists |
| The prospect and the story | Stays Tom Becker, the landlord | Whatever the call says |
| Fictional note | Only when `profile.fictional` is true; the end card note always shows | Only when `profile.fictional` is true |

A profile with no priced service gets "Price on request" in the proposal and the transcript line at 18:13.

## 6. Architecture

Inside `apps/meetings`. Dependencies point inwards; `eslint.config.mjs` enforces the layers.

### `domain/`

| File | Holds |
| --- | --- |
| `domain/transcript.ts` | `SpeakerTurn { atSeconds?: number; speaker: string; text: string }`, `parseTranscript(text)`, `formatTranscript(turns)`, `transcriptLimits`, `checkTranscript(text)` returning the issues of section 4 |
| `domain/call-sides.ts` | `identifySides(turns, profile)` returning `{ seller, prospect }` |
| `domain/deal-stage.ts` | `dealStages` ("Discovery", "Proposal drafted", "Proposal sent", "Won", "Lost"), `normaliseStage(text)`, `stageAfterSend` |
| `domain/output-sequence.ts` | `OutputKind` (summary, numbers, crm, proposal, email, meeting), `outputSequence`, `laneOf(kind)`, `revealPlan(stepMs, reducedMotion)` |
| `domain/lanes.ts` | The five lane ids and labels, shared by the film and live mode |
| `domain/timing-metric.ts` | `elapsedMs(fromIso, toIso)`, `formatDuration(ms)`: "45 seconds", "1 min 12 s", "4 minutes", "2 days" |
| `domain/proposal-service.ts` | `proposalService(profile)` returning `{ name, description, price }` with the "Price on request" rule |
| `domain/profile-tokens.ts` | `profileTokens(profile)` and `fillTokens(text, tokens)`, which throws on an unknown token |

### `application/`

| File | Holds |
| --- | --- |
| `application/process-call.ts` | `processCall({ transcript, profile, localNow }, { ai })`. Parses and checks the transcript, builds the request with `@diepen/voice/tasks/call-outputs` (system prompt through `buildSystemPrompt`), passes `draftMockOutputs` as `mock`, calls `ai.generateObject`, then enforces price, meeting length and stage |
| `application/draft-mock-outputs.ts` | The deterministic mock of section 4 |

The `AiProvider` is a parameter, so tests pass the mock provider or a fake.

Speech recognition stays in `ui/` because it is a browser API with no server side.
`ui/speech/speech-recognizer.ts` defines a small interface and the rest of the UI sees only that:

```ts
export type SpeechRecognizer = {
  readonly supported: boolean;
  start(handlers: {
    onInterim(text: string): void;
    onFinal(text: string): void;
    onError(kind: "denied" | "no-speech" | "other"): void;
    onEnd(): void;
  }): void;
  stop(): void;
};
export function createSpeechRecognizer(scope: Window): SpeechRecognizer;
```

`createSpeechRecognizer` wraps `SpeechRecognition ?? webkitSpeechRecognition`, maps error codes to the three kinds, and returns `{ supported: false }` with no-op methods when neither exists.
`LiveDemo` gets it through a prop with `createSpeechRecognizer(window)` as the default, so unit tests pass a fake object and e2e tests replace the browser constructor.

### `infrastructure/`

| File | Holds |
| --- | --- |
| `infrastructure/container.ts` | `getContainer()`: the provider from the `@diepen/ai` factory (`claude` with a key, else `mock`), the cost guards, `providerName`, and `processCall` bound to the provider |

### `ui/`

| File | Holds |
| --- | --- |
| `ui/lanes/call-lane.tsx` | Transcript mockup with speakers, live append, "Call ended" state, interim line |
| `ui/lanes/ai-lane.tsx` | Waiting and reading states, summary card, number chips, pain points |
| `ui/lanes/crm-lane.tsx` | Existing deals and the new record, built on the CRM card mockup |
| `ui/lanes/proposal-lane.tsx` | Proposal document and follow-up email with attachment chip, draft and sent status, optional send action |
| `ui/lanes/calendar-lane.tsx` | Week view built on the calendar mockup, new event highlighted |
| `ui/lanes/render-lane.tsx` | The `renderLane` the film stage calls, and the grid live mode renders |
| `ui/live/live-demo.tsx` | Client component and its state: idle, recording, ready, processing, revealing, revealed, sent, failed |
| `ui/live/transcript-input.tsx` | Tabs, transcript box, counter, inline issues |
| `ui/live/record-panel.tsx` | Speaker toggle, Start and Stop, interim text, fallback notes |
| `ui/live/send-result.tsx` | "Transcript to proposal sent" bar |
| `ui/live/outputs-client.ts` | `fetch` to `/api/outputs`, zod parse of each response shape |
| `ui/speech/speech-recognizer.ts` | The interface and browser adapter above |

### `film/`

| File | Holds |
| --- | --- |
| `film/meetings-film.ts` | `buildMeetingsFilm(profile): FilmScript<MeetingsFilmData>`: lanes, beats of section 2, clock keyframes, captions and end card, tokens filled |
| `film/fixtures/sample-call.ts` | The sample call and `sampleCallEndsAt` |
| `film/fixtures/recorded-outputs.ts` | The recorded outputs |
| `film/fixtures/existing-tools.ts` | Existing CRM deals and calendar events |

### `app/`

| Route | File | Contract |
| --- | --- | --- |
| `/` | `page.tsx` and `film-view.tsx` (client) | Shell in film mode; builds the film from the active profile; reads `?t=` and `?fallback=limit` |
| `/live` | `live/page.tsx` | Server component; passes `providerName` and the sample call to `LiveDemo` |
| `POST /api/outputs` | `api/outputs/route.ts`, `api/outputs/request-schema.ts` | See below |
| `POST /api/brand` | `api/brand/route.ts` | Re-exports the handler from `@diepen/voice/brand-route` with this app's guards; its request and response are the package's |
| `GET /api/health` | `api/health/route.ts` | `{ ok: true, app: "meetings" }`, already there |

`POST /api/outputs`:

```ts
// request-schema.ts
export const outputsRequestSchema = z.object({
  transcript: z.string().trim().max(30_000), // plus superRefine with domain checkTranscript: 20 words, 400 turns
  profile: companyProfileSchema.optional(), // absent: the default meetings preset
  localNow: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/), // the visitor's wall clock, so "Friday at ten" resolves in their week
});
```

| Status | Body |
| --- | --- |
| 200 | `{ outputs: CallOutputs, provider: "claude" \| "mock" }` |
| 400 | `{ error: "invalid_request", issues: { path: string, message: string }[] }`, messages from section 4 |
| 413 | `{ error: "too_large" }` when the raw body is over 100 KB, checked before JSON parsing |
| 429 | `{ fallback: "film" }` when a guard trips |
| 502 | `{ error: "generation_failed" }` when the provider throws or the answer fails the schema |

The route validates, runs the guards, calls `processCall` through the container, and returns. Nothing else.

## 7. Layout

### Film

| Viewport | Layout |
| --- | --- |
| 1920x1080 | Four columns: Call 26%, AI 22%, a column with CRM on top and Calendar below 22%, Proposal and email 30%. Caption bar under the stage at 32 px, transcript text 20 px, controls in one row at the bottom. No page scroll |
| 1440x900 | The same grid. Transcript shows the last six lines; caption 26 px; transcript 16 px. No page scroll |
| 375 wide | One lane at a time: the lane of the latest beat fills the width, a row of five lane chips above it marks the active lane and lanes with new items. Travel animates between chips. Caption below the lane, at most two lines at 18 px. Controls at the bottom with 44 px targets. The end card stacks before over after |

### Live

| Viewport | Layout |
| --- | --- |
| 1920x1080 and 1440x900 | Input column at 32% on the left (tabs, transcript box, button). Right side is the lane grid without the call lane: AI, then CRM over Calendar, then Proposal and email. The result bar spans the right side once sent |
| 375 wide | One column: tabs, transcript box, button, then the six outputs as cards in sequence order. Each new card scrolls into view. Long emails and scope lines wrap; no fixed widths |

Nothing may overflow horizontally at 375 px in either mode: `document.documentElement.scrollWidth` stays at or below 375.

## 8. Acceptance checks

Every check names the feature id it proves. Flow tests carry `@<id>` in their title so `pnpm verify flow <id>` finds them.

### Selectors

| Selector | Element |
| --- | --- |
| `[data-lane="call\|ai\|crm\|proposal\|calendar"]` | A lane, in both modes |
| `[data-output="summary\|numbers\|crm\|proposal\|email\|meeting"]` | A revealed output |
| `role=timer` | The story clock |
| `[data-end-card]` | The end card |
| Buttons by name | "Turn this call into a proposal", "Sample call", "Paste", "Record", "Start", "Stop", "Send to …", "Start over", "Try again" |

### Unit checks (Vitest)

| # | Feature | Check |
| --- | --- | --- |
| U1 | `meetings.live-paste` | `parseTranscript` on the filled sample call gives 36 turns, exactly two speakers, the first at 0 s and the last at 1918 s |
| U2 | `meetings.live-paste` | `parseTranscript` reads `Name: text`, `00:17 Name: text` and `[1:02:03] Name: text` (3723 s); a line without a label joins the previous turn; text before any label gets speaker "Speaker" |
| U3 | `meetings.live-paste` | `checkTranscript` accepts exactly 30,000 characters and rejects 30,001; rejects 19 words and accepts 20; rejects 401 turns. Each issue carries the section 4 message |
| U4 | `meetings.live-paste` | `identifySides` picks the speaker matching the owner's first name as seller; falls back to the first speaker; prospect falls back to "Prospect" |
| U5 | `meetings.live-sample` | `outputSequence` is summary, numbers, crm, proposal, email, meeting; `laneOf` maps them to ai, ai, crm, proposal, proposal, calendar; `revealPlan(700, false)` is `[0, 700, 1400, 2100, 2800, 3500]` and `revealPlan(700, true)` is all zeros |
| U6 | `meetings.film` | `formatDuration` gives "4 minutes" for 14:32:10 to 14:36:10, "2 days" for 172,800,000 ms, "1 min 12 s" for 72,000 ms, "45 seconds" for 45,000 ms |
| U7 | `meetings.make-it-yours` | `proposalService` returns the first priced service; a profile with no priced service returns price "Price on request" |
| U8 | `meetings.make-it-yours` | `fillTokens` fills every token of section 2 and throws on an unknown one. After `buildMeetingsFilm` with each preset, no caption, transcript line or output contains `{` |
| U9 | `meetings.live-sample` | `processCall` with the mock provider on the sample call and the default preset returns a value that passes the `call-outputs` schema, contactName "Tom Becker", the numbers and pain points of section 4, `proposal.price` equal to the preset's price, `durationMinutes` equal to its `bookingMinutes`; two runs with the same `localNow` are deep-equal |
| U10 | `meetings.live-paste` | `processCall` with a fake provider that returns another price and a 15-minute meeting returns the profile's price and `bookingMinutes`; the request it sent has role `analysis` and a system prompt that contains the profile's name |
| U11 | `meetings.live-paste` | The route answers 400 with `path: "transcript"` for a missing, too short or too long transcript, 400 for an invalid profile or `localNow`, 413 for a 101 KB body, 429 `{ fallback: "film" }` when the guard trips, 502 when the provider throws, and 200 `{ outputs, provider: "mock" }` for the sample call |
| U12 | `meetings.film` | `buildMeetingsFilm`: beats sorted by ms, every lane and travel end is one of the five lanes, clock keyframes strictly increase, the last beat is at 67,000 and the film ends at 80,000, the end card "after" is "4 minutes", every caption has at most 60 characters and no "—" or "–" |
| U13 | `meetings.film` | The recorded outputs pass the `call-outputs` schema after filling tokens; the sample call has 25 to 40 lines |
| U14 | `meetings.live-record` | `createSpeechRecognizer` on a window without either constructor has `supported: false`; with a fake constructor, final results reach `onFinal`, interim results reach `onInterim`, and `not-allowed` maps to `denied` |
| U15 | `meetings.live-record` | The record panel with a fake recognizer appends `[00:03] {owner first name}: …` then, after the toggle, `[00:09] Prospect: …`, and stops at 10 minutes with fake timers |

### Flow checks (Playwright, mock provider, desktop and phone projects)

Every flow test fails on any `console` error or `pageerror` through one shared fixture.

| # | Feature | Check |
| --- | --- | --- |
| F1 | `meetings.film` | `/` at 4x speed reaches the end card within 25 s and shows "Call end to proposal sent", "2 days", "4 minutes" and the fictional note |
| F2 | `meetings.film` | With every `/api/*` request except health aborted, `/?t=60000` still plays to the end card: the film needs no network |
| F3 | `meetings.film-controls` | Pause keeps the clock text unchanged for 1 s; play moves it; restart shows 14:00:00 and the first line; speed 2x moves the clock further in 1 s than 1x |
| F4 | `meetings.film-controls` | `/?t=49000` opens with the proposal visible in `[data-lane="proposal"]` and the clock at 14:33:50 |
| F5 | `meetings.live-sample` | `/live`, "Sample call", "Turn this call into a proposal": all six `[data-output]` appear in sequence order, the CRM shows "Tom Becker", the proposal shows the preset's price, and "Demo answers, no API key set" is visible |
| F6 | `meetings.live-paste` | Paste a fictional 6-line transcript between the preset owner and "Rosa Lindqvist" with the numbers 12 and 40: all six outputs appear, the CRM contact is "Rosa Lindqvist", and the numbers output shows 12 and 40 |
| F7 | `meetings.live-paste` | A 10-word paste disables the button and shows the 20-word message; the counter reads "30,000 / 30,000" when the box is full |
| F8 | `meetings.live-record` | With both constructors removed by an init script, the Record tab shows the "Recording needs Chrome, Edge or Safari" note, no Start button, and the Paste path still works |
| F9 | `meetings.live-record` | With a fake constructor that fires `error` `not-allowed` on start, the page shows the blocked microphone note and "Try again" |
| F10 | `meetings.live-record` | With a fake constructor that emits two final results, toggling the speaker in between, the transcript box holds two lines with the two speakers, and the button produces six outputs |
| F11 | `meetings.live-send` | After the outputs, "Send to Tom" shows "Sent", the CRM stage "Proposal sent" and "Transcript to proposal sent:" with a duration |
| F12 | `meetings.limit-fallback` | With `/api/outputs` routed to 429 `{ fallback: "film" }`, pressing the button lands on the film with the shell's fallback note |
| F13 | `meetings.live-paste` | With `/api/outputs` routed to 502, the page shows "The draft did not come through. Try again." and "Try again" succeeds once the route is released |
| F14 | `meetings.make-it-yours` | `/live?brand=<test profile>` (fictional, its own name, owner and price) shows its name in the header; the sample call uses its owner; the proposal shows its price. `/?brand=<same>&t=63000` shows its name in the CRM, proposal and email |
| F15 | `meetings.make-it-yours` | With `/api/brand` routed to return the test profile, the "Make it yours" panel applies it and the `--brand` CSS variable equals its brand colour |
| F16 | `meetings.film` | At 375x812, `/`, `/?t=40000`, `/?t=70000`, `/live` and `/live` after the six outputs have `scrollWidth` at most 375 |
| F17 | `meetings.film` | At 1920x1080 and 1440x900, `/?t=63000` shows all five lanes inside the viewport with no vertical page scroll |

## 9. Feature rows

| Id | A user can | Reach it | As | Status |
| --- | --- | --- | --- | --- |
| `meetings.film` | Watch a sales call turn into a summary, CRM record, proposal, email and next meeting, ending on call end to proposal sent | `/` | anon | planned |
| `meetings.film-controls` | Pause, play, restart, change speed and start the film at a given moment | `/`, the controls, or `/?t=49000` | anon | planned |
| `meetings.live-sample` | Load the sample call and get all six outputs | `/live`, "Sample call", "Turn this call into a proposal" | anon | planned |
| `meetings.live-paste` | Paste a call transcript and get all six outputs | `/live`, "Paste", "Turn this call into a proposal" | anon | planned |
| `meetings.live-record` | Record a role-played call with the microphone, or see why recording is not available | `/live`, "Record", "Start" | anon | planned |
| `meetings.live-send` | Send the follow-up email (simulated) and see the time from transcript to proposal sent | `/live`, after the outputs, "Send to …" | anon | planned |
| `meetings.limit-fallback` | See the film with a short note when the live demo hits its limit | `/live`, "Turn this call into a proposal" while a guard trips | anon | planned |
| `meetings.make-it-yours` | See the film and live mode in their own company's brand, voice and prices | `/`, "Make it yours", or `/live?brand=…` | anon | planned |

## 10. Open questions

Each one runs on its default until Leander decides.
None is in `docs/decisions.md` yet, because this plan's scope is this file only.

| Question | Default |
| --- | --- |
| With a visitor's profile, should the film keep the landlord story? | Yes. The film swaps the seller's name, logo, colours, price, sign-off and meeting length; the call stays the landlord story. Live mode is where their own call runs |
| Is "2 days" the right "before" for call end to proposal sent? | Yes, as this fictional scenario's manual routine, stated in the end card note |
| Chrome and Edge send recorded audio to their own speech service. Should the page say so? | Yes, one line under the Record button: "Your browser's speech service turns your voice into text." |
| How does a single person record both sides of a call? | A "Speaking now" toggle sets the speaker of each final result |
| Is "Send" in live mode simulated, and what does the live number measure? | Simulated, no email leaves the page. The number runs from pressing "Turn this call into a proposal" to pressing send |
| Which currency do the sample numbers use? | None. The transcript says "1,150 a month"; the only currency is in the profile's price string |
| How long can a transcript and a recording be? | 30,000 characters and 10 minutes |
| Should paste accept Zoom, Teams or Otter export formats (WebVTT, speaker on its own line)? | Not in the first version. The four line formats of section 4 only |
