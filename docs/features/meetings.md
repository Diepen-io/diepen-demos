# meetings

Demo 3, "Call to close", in `apps/meetings` on port 3103.
A sales call becomes a summary, the client's numbers and pain points, a CRM record, a proposal at the seller's price, a follow-up email and the next meeting.
This file is the plan: a test writer and a builder need nothing else.

## 1. What it proves

You finish a sales call and the follow-up work is already drafted: summary, CRM record, proposal at your own prices, follow-up email and the next meeting in your calendar.
You read it, press send, and the prospect has your proposal 4 minutes after you hang up.

## 2. Film script

The film is a keynote film: four beats and a finale, each on screen for 3,200 ms, so it runs 16,000 ms.
Each beat shows one caption of at most six words and one element, centred on the brand backdrop, with at most one status chip (decision F2).
It runs from recorded fixtures with no key and no network.
`film/meetings-keynote.tsx` builds it on the shared keynote engine in `@diepen/ui/film/keynote-script`, `keynote-stage` and `keynote-parts`.

### Tokens

Fixtures and captions hold tokens that `domain/profile-tokens.ts` fills from a `CompanyProfile`.
The film always tells Brickfern's story (decision F1), so it fills them from the meetings preset.
Live mode fills the sample call from the visitor's profile, so every token reads well when the owner is a person with a title ("Dr. Lena Okafor"), a group ("the team", which brand extraction writes when a site names nobody), or when no service has a price.
`domain/seller.ts` decides how the seller is named; `domain/person-name.ts` holds its own `firstName`, because domain code may not import `@diepen/voice/person-name`; both skip titles and keep a group name such as "the team" whole, and change together.

| Token | Value |
| --- | --- |
| `{sellerCompany}` | `profile.name` |
| `{sellerOwner}` | The seller's speaker label: `profile.people.owner.name`, or the company name when the owner is not a person. At most 40 characters, cut at a word break, no colon |
| `{sellerOwnerFirst}` | The owner's first name without a title ("Dr. Lena Okafor" gives "Lena"), or "You" when the owner is not a person |
| `{sellerIntro}` | How the seller opens the call: "Jonas from Brickfern Property Management", or "the team at Brickfern Property Management" |
| `{sellerSignature}` | The name under the follow-up email: the owner's full name, or "The Brickfern Property Management team" |
| `{sellerEmail}` | `profile.knowledge.contactEmail` |
| `{serviceName}` | Name of the first service in `profile.knowledge.services` that has a `price` |
| `{servicePrice}` | That service's `price`, verbatim. "Price on request" when no service has a price |
| `{servicePriceLine}` | "{serviceName} is {servicePrice}." With no priced service: "I'll work out the price for {serviceName} from your numbers." |
| `{signOff}` | `profile.voice.signOff` |
| `{signOffGreeting}` | The first line of `profile.voice.signOff`, for example "Best regards,". The owner signs the follow-up email with it and `{sellerSignature}`, because the full sign-off can name the AI assistant |
| `{bookingMinutes}` | `profile.knowledge.bookingMinutes`, a number |

### Beats

| Step | `?t=` from | Caption | Element | Chip |
| --- | --- | --- | --- | --- |
| 0 | 0 | The call ends. | Card, phone icon: "Discovery call", "Call with Tom Becker", "Call ended", value "32:10" | none |
| 1 | 3200 | The numbers, pulled from the call. | Three figures: 14 Apartments, 38 Days empty, 9 h A week on tenants | none |
| 2 | 6400 | Proposal drafted. | Card, file icon: `{sellerCompany}`, the proposal title "{serviceName} for Becker Residential", value `{servicePrice}` | none |
| 3 | 9600 | Sent 4 minutes later. | Card, mail icon: "Follow-up email", "Your proposal from {sellerCompany}", "To Tom Becker" | "Sent 14:36", pass |
| 4 | 12800 | Finale | "Call end to proposal sent", "2 days" to "4 min", "Try it yourself", the fictional note | none |

The call length (32:10) comes from `sampleCallStartsAt` and `sampleCallEndsAt`, and the three figures from the recorded outputs, never from literals.
`?t=<ms>` opens the film paused on the step that holds that moment; `?record=1` hides the shell and shows the company with its "Fictional company" badge above the stage.

### Finale

| Field | Text |
| --- | --- |
| Label | Call end to proposal sent |
| Before | 2 days |
| After | 4 min |
| Note | A simulation with {sellerCompany}, a fictional company. Without help, this takes 2 days. You type the notes that evening and send the proposal on Thursday. |

"After" is computed from the call end (14:32:10) and the send moment `proposalSentAt` (14:36:10), and the caption of step 3 uses the same minutes, so the two cannot drift.
"Before" is a fixed fixture value that belongs to the fictional scenario, and the note says so.

## 3. Fixtures

All people and companies here are fictional.
Tom and Anna Becker, Becker Residential and Elm Street exist only in this demo.
The seller is whatever profile is active; the default is the meetings preset from `@diepen/voice/presets`.

### Sample call

Stored as `film/fixtures/sample-call.ts`, one exported string in exactly this format, tokens unfilled.
The film and the "Sample call" tab in live mode both use it.
It has 36 lines and runs from 00:00 to 32:10.

```text
[00:00] {sellerOwner}: Hi Tom, it's {sellerIntro}. Thanks for making the time. Can you hear me okay?
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
[18:13] {sellerOwner}: {servicePriceLine} I'll put the details in writing.
[24:30] Tom Becker: Can you put all of that in writing today? Anna will want to see it with our numbers.
[24:38] {sellerOwner}: You'll have it this afternoon. When would you want to start?
[24:42] Tom Becker: January would be ideal. The first of January, clean start.
[27:15] {sellerOwner}: Then let's walk the three buildings together first. Does Friday at ten work?
[27:20] Tom Becker: Friday at ten works. I'll ask Anna to come too. Send it to tom@becker-residential.example, that's the company, Becker Residential.
[31:46] Tom Becker: This was useful. I hadn't seen how the empty days add up.
[31:58] {sellerOwner}: Talk Friday then, Tom. Thanks.
```

The call ends at 32:10 (story time 14:32:10); the end time is a fixture constant `sampleCallEndsAt = "2026-11-10T14:32:10"`, not a transcript line.

### Guide

A guide bar above the input column shows one next step at a time (decision G1): "Step N of 3", one short instruction, and one large button or a brand ring on the one element to use.
The page scrolls, so the bar stays at the top (`sticky`), and the input column sticks below it.
`ui/live/live-guide.ts` works the step out from the call's status, whether the box holds a valid transcript, and whether it changed after drafting.
The texts below are the defaults; tests check the step ids, never the words.

| Step | Id | When | Instruction | Points at |
| --- | --- | --- | --- | --- |
| 1 | `load` | No valid transcript | You play the seller after a sales call. Start with our sample call. | Button "Load the sample call": opens the "Sample call" tab, which fills the box |
| 2 | `submit` | A valid transcript, no outputs | Now let the AI read the call. Tap Turn this call into a proposal. | Ring on "Turn this call into a proposal" |
| 2 | `reading` | Processing | The AI reads the call | "One moment" |
| 2 | `stale` | The transcript changed after drafting | You changed the call. Tap Draft again. | Ring on "Draft again" |
| 2 | `failed` | The model call failed | The draft failed. Tap Try again. | Ring on "Try again" |
| 3 | `drafting` | Revealing | The AI writes the notes, the deal, the proposal and the email | "One moment" |
| 3 | `send` | Revealed | Read the proposal and the email. Then tap Send. | Ring on "Send to {first name}" |
| End | `end` | Sent | You sent the email with the proposal. The next meeting is in the calendar. | "Start over" and "Watch the film" |

The lane roles read "Reads the call", "Your list of deals", "Ready to send" and "This week".

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
      "{signOffGreeting}\n{sellerSignature}",
  },
  nextMeeting: {
    title: "Walkthrough with Tom Becker",
    durationMinutes: 0, // replaced by profile.knowledge.bookingMinutes when the film is built
    start: "2026-11-13T10:00:00",
    agenda: ["Walk all three buildings", "Look at the boilers and the repair history", "Agree the handover date with Anna"],
  },
};
```

## 4. Live mode (`/live`)

The visitor plays both sides of a call, or brings a real transcript, and gets all six outputs from Claude in the active profile's voice and prices.

### Flow

1. `/live` opens with the shell's Watch or Try it switch, the active brand, the fictional note when `profile.fictional` is true, and "You see sample answers. The AI is off here." when the container's provider is `mock`.
2. The input column has three tabs: "Record", "Paste" and "Sample call". "Record" is selected when the browser supports speech recognition, otherwise "Paste".
3. Every tab ends in the same editable transcript box with a counter, for example "1,240 / 30,000". The box text is 16 px on phones so iOS does not zoom.
4. While the box holds a valid transcript, the AI lane says "Ready to read 12 turns"; otherwise "Waiting for a transcript".
5. The visitor presses "Turn this call into a proposal". A running recording stops first.
6. The AI lane shows "Reading 12 turns" with the turn count of the submitted transcript and a seconds counter.
7. When the response arrives, the six outputs appear one after the other, 700 ms apart, in this order: summary, numbers and pain points, CRM record, proposal, follow-up email, next meeting.
8. The email card has "Send to {prospect first name}", or "Send the email" when the call never names the prospect, and the line "Simulated email."
9. On send, the email shows "Sent HH:MM", the CRM stage changes to "Proposal sent", the CRM next step becomes "Proposal sent. Next: {meeting title} on {weekday day month} at {HH:MM}.", and a result bar shows "Transcript to proposal sent: 1 min 12 s", measured from the press in step 5 to the send. On desktop the bar spans the top of the output side; on a phone it shows right under the email, so the page does not jump.
10. "Start over" clears the outputs and keeps the transcript. It sits under the main button until the email is sent; then the guide offers it.
11. When the transcript changes after the outputs exist (an edit, a paste, more recording, a loaded sample), a note says "You changed the call. These drafts belong to the earlier version." with "Draft again". The outputs dim and cannot be sent until they are drafted again.

With `prefers-reduced-motion: reduce`, all six outputs appear at once without motion.

### Record

- The recorder uses the browser's Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`) with `continuous` and `interimResults` on and `lang` from `navigator.language`.
- A two-option toggle "Speaking now: {sellerOwnerFirst} | Prospect" sets the speaker of the next final result, so one person can role-play both sides. With a team profile the seller side reads "You".
- The page holds the recording, so "Turn this call into a proposal" and switching to another tab stop it.
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
- "Sample call" fills the box with the sample call from section 3, tokens filled from the active profile, when the box is empty or already holds the sample. When it holds the visitor's own transcript, the tab says "Loading the sample replaces the transcript in the box." and fills it only on "Replace with the sample call".

### Input limits

| Limit | Value | Message |
| --- | --- | --- |
| Minimum | 20 words | "Add a bit more of the call. It needs at least 20 words." |
| Maximum | 30,000 characters, about 35 minutes of speech | "That is over 30,000 characters. Trim it to the part of the call that matters." |
| Turns | 400 after parsing | "That is over 400 turns. Trim it to the part of the call that matters." |
| Recording | 10 minutes | See Record |
| Request body | 100 KB | Route answers 413. `readBodyText` from `@diepen/ai/request-body` counts bytes while the body streams in and stops reading at the cap |

The button stays disabled while the client-side check fails; the route checks again with the same domain rules.

### One structured call, revealed in sequence

The outputs come from one `generateObject` call with the `call-outputs` schema, model role `analysis` (`claude-sonnet-5-5`), `maxTokens` 2,000, and the UI reveals them in sequence.
Reasons:

- The outputs depend on each other: the email cites the proposal's price, the CRM next step names the meeting, the proposal reuses the numbers. One call keeps them consistent.
- One call counts once against the rate limit and the daily cap. Six streamed calls would cost six times the guard budget for one click.
- The schema validates the whole answer before anything shows, so the visitor never sees a half-written proposal that fails later.
- Revealing the outputs one by one shows the visitor each step land in its tool, the way the film tells it.
- The cost is a wait of roughly 10 to 20 seconds before the first output; the AI lane shows "Reading N turns" and a seconds counter during it.

After the call, `process-call.ts` overwrites `proposal.price` with `{servicePrice}` from the profile and `nextMeeting.durationMinutes` with `profile.knowledge.bookingMinutes`, so the proposal never carries a price the profile does not have.
It normalises `crm.stage` to a domain deal stage, defaulting to "Proposal drafted".

### Keyless mock and cost guards

- Without `ANTHROPIC_API_KEY`, or with `AI_PROVIDER=mock`, the container returns the mock provider and the screen shows "You see sample answers. The AI is off here." (decision D4).
- When a guard trips, `/api/outputs` answers 429 `{ fallback: "film" }`. The live page then sends the visitor to the film with the shell's fallback note, at `/?fallback=limit` (`useFilmFallback`).
- When the provider throws or its answer fails the schema, the route answers 503 with `unavailableResponse`, like the other apps, and the page shows "The draft failed. Try again." with a "Try again" button.

### What the mock provider answers

The mock is `application/draft-mock-outputs.ts`, passed as the request's `mock`.
It is pure and deterministic for a given transcript, profile and `localNow`, so e2e can assert on content.

| Field | Rule |
| --- | --- |
| Seller, prospect | Seller is the first speaker named with the owner's first name (case-insensitive) or labelled as the seller ("You", the company), else the first speaker. Prospect is the first other speaker, else "Prospect" |
| Contact | The prospect's label when it is a person. A recorded "Prospect" takes the name from the seller's greeting ("Hi Rosa,"), else "New contact". Company: a name after "company" ("that's the company, Becker Residential") or a name ending in Residential, Homes, Lettings, GmbH, Ltd and the like, else the contact's own name, as for a private owner. Email: the first address the prospect says |
| `summary` | `{Contact} of {company} spoke with {seller} over {n} turns. {First name} said: "{first pain point}" Next: send the proposal and meet on {weekday}.` The seller is "{owner} of {company}", or the company for a team profile |
| `numbers` | Each figure in the prospect's turns, at most 6. Years (1900 to 2099) and clock times are skipped. The label is the phrase that follows the figure up to four words ("Apartments across three buildings", "Hours a month"); a bare rate such as "1,150 a month" takes its subject from the question just before ("What's the average rent?" gives "Average rent a month"). A time figure that answers a "how long ... empty?" question takes the question's last word ("Days empty"). A money figure (rent, price, cost, fee, budget) said without a currency gets the currency of the profile's quoted price ("EUR 1,150"). A figure nothing explains is left out |
| `painPoints` | Prospect sentences matching `worst\|problem\|late\|drags\|empty\|hours\|chasing\|stress\|too much\|cost`, case-insensitive, first 3. Else `["The call names no pain point yet."]` |
| `crm` | company and contact as above, contactRole "Prospect", the email when said, stage "Proposal drafted", dealValue `{servicePrice}` or "Not priced yet", nextStep "Send the proposal today. {meeting title} on {weekday day month} at {time}." |
| `proposal` | title `{serviceName} for {company}`, or `{serviceName} proposal` for an unnamed contact; scope `["{serviceName}: {service description}"]`, price `{servicePrice}`, timeline "Start on {day} {month}" when the call names a day of a month ("the first of January"), else "Start within two weeks of signing", terms "Valid for 30 days." |
| `followUpEmail` | subject `Your proposal from {sellerCompany}`, greets "Hi {first name}," or "Hello,", names the service and price ("at EUR 34 per unit per month", or "from EUR 290" for a price that starts with "from"; else "we'll agree the price when we meet"), names the meeting day and time, ends with `{signOffGreeting}` and `{sellerSignature}` |
| `nextMeeting` | title `Proposal review with {contact}`, or "Proposal review"; durationMinutes `{bookingMinutes}`, start the last weekday and time the call names ("Friday at ten" is the next Friday after `localNow` at 10:00; an hour from 1 to 7 without am or pm is the afternoon), else 10:00 on the first weekday at least two days after `localNow` (`application/read-dates.ts`), agenda `["Questions on the proposal", "Agree the start date", "Next steps"]` |

For the sample call with the default preset, the mock gives contact "Tom Becker" of "Becker Residential" at tom@becker-residential.example, numbers 14 "Apartments across three buildings", 38 "Days empty" and "EUR 1,150" "Average rent a month", the meeting on Friday at 10:00, the timeline "Start on 1 January", and pain points `["A normal week, about nine hours.", "Calls, texts, chasing the plumber, chasing rent.", "The night calls are the worst part."]`.

## 5. Make it yours

The visitor enters a website in the shell's "Make it yours" panel; `/api/brand` drafts a profile, the visitor edits it, and it travels in `?brand=` and local storage (decision S3).
The film always tells Brickfern's story (decision F1); "Make it yours" puts the visitor's company fully into live mode.
The panel's example companies list only Brickfern, since the sample call is a landlord's (decision F3). "Read my site" and the form work for any business.

| What | Live (`/live`) |
| --- | --- |
| Logo, colours, company name in the header | Yes |
| Seller name and company in the transcript, CRM, proposal and email | From the model's answer and the sample call's tokens, worded for a person, a titled person or a team |
| Proposal service and price | First priced service of the profile, verbatim, enforced after the model answers |
| Email sign-off | `voice.signOff` greeting and `{sellerSignature}`, plus tone and words to use and avoid through `buildSystemPrompt` |
| Meeting length | `bookingMinutes`, enforced after the model answers |
| Policies (what the AI may promise) | Through `buildSystemPrompt`, so the proposal and email never promise what `neverPromise` lists |
| The prospect and the story | Whatever the call says |
| Fictional note | Only when `profile.fictional` is true |

A profile with no priced service gets "Price on request" in the proposal's price field, "Not priced yet" as the CRM deal value, and its own sentence at 18:13 of the sample call; no sentence reads "is Price on request".

## 6. Architecture

Inside `apps/meetings`. Dependencies point inwards; `eslint.config.mjs` enforces the layers.

### `domain/`

| File | Holds |
| --- | --- |
| `domain/transcript.ts` | `SpeakerTurn { atSeconds?: number; speaker: string; text: string }`, `parseTranscript(text)`, `formatTranscript(turns)`, `transcriptLimits`, `checkTranscript(text)` returning the issues of section 4 |
| `domain/call-sides.ts` | `identifySides(turns, profile)` returning `{ seller, prospect }` |
| `domain/person-name.ts` | `firstName` (skips titles, keeps "the team" whole; the same rule as `@diepen/voice/person-name`), `isPersonName` (false for "the team", "Prospect", "New contact"), `speakerLabel` (40 characters, no colon) |
| `domain/seller.ts` | `sellerOf(profile)`: how every sentence names the seller, for a person or a team |
| `domain/proposal-sent.ts` | `markProposalSent(outputs)`: stage "Proposal sent" and the meeting as the next step; `meetingMoment(start)` |
| `domain/calendar-week.ts` | `mondayOf`, `workingDays`, `weekLabel` ("9 to 13 November") for the calendar lane header |
| `domain/deal-stage.ts` | `dealStages` ("Discovery", "Proposal drafted", "Proposal sent", "Won", "Lost"), `normaliseStage(text)`, `stageAfterSend` |
| `domain/output-sequence.ts` | `OutputKind` (summary, numbers, crm, proposal, email, meeting), `outputSequence`, `laneOf(kind)`, `revealPlan(stepMs, reducedMotion)` |
| `domain/lanes.ts` | The four tool lane ids, labels and roles of live mode |
| `domain/meeting-outputs.ts` | `MeetingOutputs`: the `call-outputs` shape with `crm.stage` as a deal stage. The model contract stays the package schema |
| `domain/timing-metric.ts` | `elapsedMs(fromIso, toIso)`, `formatDuration(ms)`: "45 seconds", "1 min 12 s", "4 minutes", "2 days" |
| `domain/proposal-service.ts` | `proposalService(profile)` returning `{ name, description, price }` with the "Price on request" rule |
| `domain/profile-tokens.ts` | `profileTokens(profile)` and `fillTokens(text, tokens)`, which throws on an unknown token |

### `application/`

| File | Holds |
| --- | --- |
| `application/process-call.ts` | `processCall({ transcript, profile, localNow }, { ai })`. Parses and checks the transcript, builds the request with `@diepen/voice/tasks/call-outputs` (system prompt through `buildSystemPrompt`), passes `draftMockOutputs` as `mock`, calls `ai.generateObject`, then enforces price, meeting length and stage |
| `application/draft-mock-outputs.ts` | The deterministic mock of section 4 |
| `application/read-prospect.ts` | The mock's text rules: the prospect's figures with their labels, and pain point sentences |
| `application/read-contact.ts` | The mock's text rules: the prospect's name, company and email address |

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
| `infrastructure/container.ts` | `createContainer({ provider?, guards? })` and the app's `container`: the provider from the `@diepen/ai` factory (`claude` with a key, else `mock`), the shared cost guards, `providerName`, `processCall` bound to the provider, and the page fetcher for "Make it yours" from `pageFetcherFor` in `@diepen/voice/fixture-page-fetcher`, so tests and keyless runs never fetch the internet |

### `ui/`

| File | Holds |
| --- | --- |
| `ui/lanes/ai-lane.tsx` | Waiting and reading states, summary card, number chips, pain points |
| `ui/lanes/crm-lane.tsx` | The new deal record with its stage |
| `ui/lanes/proposal-lane.tsx`, `proposal-paper.tsx`, `follow-up-email.tsx` | Proposal page and follow-up email (on the `EmailMessage` mockup) with attachment chip, draft and sent status, optional send action |
| `ui/lanes/calendar-lane.tsx` | The working week as an agenda, one row per day, new meeting highlighted. A week grid is unreadable in a lane under 400 px wide |
| `ui/live/live-demo.tsx` | The live page: guide, input column and output lanes |
| `ui/live/live-guide.ts`, `ui/live/meetings-guide-bar.tsx` | `meetingsGuide(input)`, the guide's current step, and the sticky guide bar on the shared `GuideBar` |
| `ui/live/use-live-call.ts` | The live state: ready, processing, revealing, revealed, sent, failed, and the submitted transcript the stale check compares with |
| `ui/live/transcript-input.tsx`, `input-tabs.tsx` | Tabs, transcript box, counter, inline issues |
| `ui/live/record-panel.tsx`, `use-recording.ts` | Speaker toggle, Start and Stop, interim text, fallback notes, the 10-minute stop. `LiveDemo` holds the recording so the main button can stop it |
| `ui/live/live-lanes.tsx`, `lane-panel.tsx` | The output lanes in live mode |
| `ui/live/send-result.tsx` | "Transcript to proposal sent" bar |
| `ui/live/stale-note.tsx` | "You changed the call" note with "Draft again" |
| `ui/live/outputs-client.ts` | `fetch` to `/api/outputs`, zod parse of each response shape |
| `ui/speech/speech-recognizer.ts`, `browser-recognizer.ts` | The interface and browser adapter above, and the hook that creates it once in the browser |

### `film/`

| File | Holds |
| --- | --- |
| `film/meetings-keynote.tsx` | `buildMeetingsKeynote(profile): KeynoteFilm`: the four beats and the finale of section 2, tokens filled |
| `film/fixtures/sample-call.ts` | The sample call and `sampleCallEndsAt` |
| `film/fixtures/recorded-outputs.ts` | The recorded outputs |

### `app/`

| Route | File | Contract |
| --- | --- | --- |
| `/` | `page.tsx` | `KeynoteFilmView` with the film built from the Brickfern preset (decision F1) inside the demo shell (Watch and Try it switch, "Make it yours", the fallback note); reads `?t=`, `?brand=`, `?record=1` and `?fallback=limit` |
| `/live` | `live/page.tsx` | Server component; passes `providerName` and the sample call to `LiveDemo` |
| `POST /api/outputs` | `api/outputs/route.ts`, `api/outputs/request-schema.ts` | See below |
| `POST /api/brand` | `api/brand/route.ts` | `createBrandHandler` from `@diepen/voice/brand-route` with the container's page fetcher, provider and guards; its request and response are the package's |
| `GET /api/health` | `api/health/route.ts` | `{ ok: true, app: "meetings", provider: "claude" \| "mock" }` |

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
| 413 | `{ error: "too_large" }` when the raw body is over 100 KB: the declared length is checked first, then the bytes as they stream in, before JSON parsing |
| 429 | `{ fallback: "film" }` when a guard trips |
| 503 | `{ fallback: "film", reason: "unavailable", message }` from `unavailableResponse` when the provider throws or the answer fails the schema. The visitor stays and can try again |

The route validates, runs the guards, calls `processCall` through the container, and returns. Nothing else.

## 7. Layout

### Film

The keynote stage fills the screen under the demo shell's header with no page scroll; `?record=1` drops the shell.
The caption, the element and the chip sit centred on one column at most 44rem wide, and at 375 px the three figures stay in one row.

### Live

| Viewport | Layout |
| --- | --- |
| 1920x1080 and 1440x900 | Input column at 32% on the left (tabs, transcript box, button). Right side is the lane grid: AI, then CRM over Calendar, then Proposal and email. The result bar spans the right side once sent |
| 375 wide | One column: tabs, transcript box, button, then the six outputs as cards in sequence order. Each new card scrolls into view. Long emails and scope lines wrap; no fixed widths. Input tabs, the "Speaking now" toggle, Start, Stop, Send and Start over are at least 44 px tall |

Nothing may overflow horizontally at 375 px in either mode: `document.documentElement.scrollWidth` stays at or below 375.

## 8. Acceptance checks

Every check names the feature id it proves. Flow tests carry `@<id>` in their title so `pnpm verify flow <id>` finds them.

### Selectors

| Selector | Element |
| --- | --- |
| `[data-lane="ai\|crm\|proposal\|calendar"]` | A lane in live mode |
| `[data-output="summary\|numbers\|crm\|proposal\|email\|meeting"]` | A revealed output |
| `[data-keynote-step]` | The film step on screen, 0 to 4 |
| `[data-keynote-finale]` | The finale |
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
| U8 | `meetings.make-it-yours` | `fillTokens` fills every token of section 2 and throws on an unknown one. After `buildMeetingsKeynote` with each preset, no caption, element text or note contains `{` |
| U9 | `meetings.live-sample` | `processCall` with the mock provider on the sample call and the default preset returns a value that passes the `call-outputs` schema, contactName "Tom Becker", the numbers and pain points of section 4, `proposal.price` equal to the preset's price, `durationMinutes` equal to its `bookingMinutes`; two runs with the same `localNow` are deep-equal |
| U10 | `meetings.live-paste` | `processCall` with a fake provider that returns another price and a 15-minute meeting returns the profile's price and `bookingMinutes`; the request it sent has role `analysis` and a system prompt that contains the profile's name |
| U11 | `meetings.live-paste` | The route answers 400 with `path: "transcript"` for a missing, too short or too long transcript, 400 for an invalid profile or `localNow`, 413 for a 101 KB body and for an endless streamed body without a declared length, 429 `{ fallback: "film" }` when the guard trips, 503 `unavailable` when the provider throws, and 200 `{ outputs, provider: "mock" }` for the sample call |
| U12 | `meetings.film` | `buildMeetingsKeynote`: the four captions of section 2 in order, "32:10", the three figures, the preset's price, "Sent 14:36", and a finale of "2 days" to "4 min" with a note that names the fictional company. The engine rejects captions over six words, dashes and more than four beats |
| U13 | `meetings.film` | The recorded outputs pass the `call-outputs` schema after filling tokens; the sample call has 25 to 40 lines |
| U14 | `meetings.live-record` | `createSpeechRecognizer` on a window without either constructor has `supported: false`; with a fake constructor, final results reach `onFinal`, interim results reach `onInterim`, and `not-allowed` maps to `denied` |
| U15 | `meetings.live-record` | The record panel with a fake recognizer appends `[00:03] {owner first name}: …` then, after the toggle, `[00:09] Prospect: …`, and stops at 10 minutes with fake timers |
| U16 | `meetings.make-it-yours` | `firstName` skips titles; `isPersonName` is false for "the team" and "Prospect"; `sellerOf` names a team profile by its company; the sample call filled from a titled, a team and an unpriced profile has 36 turns, finds Tom Becker and never reads "it's the from" or "is Price on request" |
| U17 | `meetings.live-sample` | The mock labels each figure, skips the year 2015, reads "Becker Residential" and Tom's email from the call, names a recorded prospect from the greeting, and writes to "New contact" with "Hello," when no name is said |
| U18 | `meetings.live-send` | `markProposalSent` sets "Proposal sent" and the next step "Proposal sent. Next: {meeting} on Friday 13 November at 10:00." |
| U19 | `meetings.guide` | `meetingsGuide` returns each row of the guide table in section 4 |

### Flow checks (Playwright, mock provider, desktop and phone projects)

Every flow test fails on any `console` error or `pageerror` through one shared fixture.

| # | Feature | Check |
| --- | --- | --- |
| F1 | `meetings.film-controls` | `/?t=<step × 3200 + 400>` opens each of the five steps in order, `[data-keynote-step]` names the step, and each shows its caption and its element |
| F2 | `meetings.film` | With every `/api/*` request except health aborted, `/?t=9600` plays to the finale, which shows "2 days", "4 min" and "Try it yourself" linking to `/live` |
| F3 | `meetings.film` | `/?record=1` hides the shell and shows the company and "Fictional company" |
| F5 | `meetings.live-sample` | `/live`, "Sample call", "Turn this call into a proposal": all six `[data-output]` appear in sequence order, the CRM shows "Tom Becker", the proposal shows the preset's price, and "You see sample answers. The AI is off here." is visible |
| F6 | `meetings.live-paste` | Paste a fictional 6-line transcript between the preset owner and "Rosa Lindqvist" with the numbers 12 and 40: all six outputs appear, the CRM contact is "Rosa Lindqvist", and the numbers output shows 12 and 40 |
| F7 | `meetings.live-paste` | A 10-word paste disables the button and shows the 20-word message; the counter reads "30,000 / 30,000" when the box is full |
| F8 | `meetings.live-record` | With both constructors removed by an init script, the Record tab shows the "Recording needs Chrome, Edge or Safari" note, no Start button, and the Paste path still works |
| F9 | `meetings.live-record` | With a fake constructor that fires `error` `not-allowed` on start, the page shows the blocked microphone note and "Try again" |
| F10 | `meetings.live-record` | With a fake constructor that emits two final results, toggling the speaker in between, the transcript box holds two lines with the two speakers, and the button produces six outputs |
| F11 | `meetings.live-send` | After the outputs, "Send to Tom" shows "Sent", the CRM stage "Proposal sent", the next step "Proposal sent. Next: …" and "Transcript to proposal sent:" with a duration |
| F12 | `meetings.limit-fallback` | With `/api/outputs` routed to 429 `{ fallback: "film" }`, pressing the button lands on the film with the shell's fallback note |
| F13 | `meetings.live-paste` | With `/api/outputs` routed to 503, the page shows "The draft failed. Try again." and "Try again" succeeds once the route is released |
| F14 | `meetings.make-it-yours` | `/live?brand=<test profile>` (fictional, its own name, owner and price) shows its name in the header; the sample call uses its owner; the proposal shows its price |
| F15 | `meetings.make-it-yours` | With `/api/brand` routed to return the test profile, the "Make it yours" panel applies it and the `--brand` CSS variable equals its brand colour |
| F16 | `meetings.film` | At 375x812, each of the five film steps, `/live` and `/live` after the six outputs have `scrollWidth` at most 375 |
| F10b | `meetings.live-record` | Pressing "Turn this call into a proposal" while recording stops the recording: Start shows again |
| F18 | `meetings.live-sample` | With a pasted transcript in the box, "Sample call" keeps it until "Replace with the sample call" |
| F19 | `meetings.live-paste` | A changed transcript after the outputs shows the "Draft again" note, disables send, and "Draft again" drafts from the new transcript |
| F20 | `meetings.live-sample` | After "Start over" the AI lane says "Ready to read 36 turns" |
| F21 | `meetings.guide` | On `/live` the guide starts on `load`; its button, the ring on "Turn this call into a proposal" and the ring on Send walk `load`, `submit`, `send` to `end`, which links to the film |

## 9. Feature rows

| Id | A user can | Reach it | As | Status |
| --- | --- | --- | --- | --- |
| `meetings.film` | Watch a call end, its numbers, the drafted proposal and the sent email, ending on call end to proposal sent | `/` | anon | shipped |
| `meetings.film-controls` | Pause, play, jump to a step and start the film at a given moment | `/`, the controls, or `/?t=6400` | anon | shipped |
| `meetings.live-sample` | Load the sample call and get all six outputs | `/live`, "Sample call", "Turn this call into a proposal" | anon | shipped |
| `meetings.live-paste` | Paste a call transcript and get all six outputs | `/live`, "Paste", "Turn this call into a proposal" | anon | shipped |
| `meetings.live-record` | Record a role-played call with the microphone, or see why recording is not available | `/live`, "Record", "Start" | anon | shipped |
| `meetings.live-send` | Send the follow-up email (simulated) and see the time from transcript to proposal sent | `/live`, after the outputs, "Send to …" | anon | shipped |
| `meetings.limit-fallback` | See the film with a short note when the live demo hits its limit | `/live`, "Turn this call into a proposal" while a guard trips | anon | shipped |
| `meetings.guide` | Follow one guided step at a time from the sample call to the sent email, then start over or watch the film | `/live`, the guide bar | anon | shipped |
| `meetings.make-it-yours` | See live mode in their own company's brand, voice and prices | `/live`, "Make it yours", or `/live?brand=…` | anon | shipped |

## 10. Open questions

Each one runs on its default until Leander decides.
None is in `docs/decisions.md` yet, because this plan's scope is this file only.

| Question | Default |
| --- | --- |
| Is "2 days" the right "before" for call end to proposal sent? | Yes, as this fictional scenario's manual routine, stated in the finale note |
| Chrome and Edge send recorded audio to their own speech service. Should the page say so? | Yes, one line under the Record button: "Your browser's speech service turns your voice into text." |
| How does a single person record both sides of a call? | A "Speaking now" toggle sets the speaker of each final result |
| Is "Send" in live mode simulated, and what does the live number measure? | Simulated, no email leaves the page. The number runs from pressing "Turn this call into a proposal" to pressing send |
| Which currency do the sample numbers use? | None. The transcript says "1,150 a month"; the only currency is in the profile's price string |
| How long can a transcript and a recording be? | 30,000 characters and 10 minutes |
| Should paste accept Zoom, Teams or Otter export formats (WebVTT, speaker on its own line)? | Not in the first version. The four line formats of section 4 only |
