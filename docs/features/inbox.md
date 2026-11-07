# inbox

Demo 1, Inbox autopilot, in `apps/inbox` on http://localhost:3101 (`pnpm dev:inbox`).
This file is the plan a test writer and a builder work from.
Where it names a shared module (`@diepen/ui/film/*`, `@diepen/voice/tasks/inbox-reply` and so on), the module's real name wins if it differs slightly.

## 1. What it proves

Every message that reaches your business at night, on email, Instagram, LinkedIn or your website chat, gets an answer in under a minute, in your words.
Questions get answered, bookings land in your calendar, and refunds and complaints wait for you, marked "Needs a human".
At 08:00 you see every conversation and its status in one list.

## 2. Film script

The film runs at `/`.
It is 16 seconds long: four beats and a finale, each on screen for 3.2 seconds.
It shows one element per beat, keynote style, on a soft wash of the brand colour (decision F2).
The film always tells Ottervale Dental's story (decision F1).
Live mode keeps every detail: threads, the calendar and the owner view.

It runs on the shared keynote engine (`KeynoteStage`, see `docs/packages.md`).
The script is `buildInboxKeynote(profile)` in `film/inbox-keynote.tsx`; its text comes from the fixtures in section 3.

### Beats

| Step | Film ms | Caption | Element | Chip |
| --- | --- | --- | --- | --- |
| 0 | 0 | Saturday, 22:14. A new DM. | `KeynoteBubble`: Priya Shah's Instagram message C2-1, customer side | none |
| 1 | 3200 | Answered in 38 seconds. (the number is Priya's reply time from the fixtures, `priyaReplySeconds()`) | `KeynoteBubble`: the assistant's reply C2-2, in the brand colour on the business side, with the logo monogram as avatar | none: the caption already says it |
| 2 | 6400 | Booked straight into your calendar. | `KeynoteSlot`: Thu 12, 09:00, "{ServiceA}, Ana Ruiz" | none |
| 3 | 9600 | Edge cases go to you. | `KeynoteNotification`: "{company} · Website chat", "Needs you: refund question", "Daniel Moore asked for a refund. The full thread is waiting." | none |
| 4 | 12800 | (finale) | The one number, then "Try it yourself" | none |

### Rules for the script

- One element on screen per beat, one caption of at most 6 words, at most one chip. `defineKeynoteFilm` refuses more words, more than 4 beats or an em or en dash.
- Captions are fixed text; message texts fill their slots from the profile.
- Each step rises in over 320 ms (fades only under `prefers-reduced-motion`). A seek, `?t=` or a step dot shows the new step at once.
- Controls: Previous beat, Play, Pause or Replay, Next beat, and five beat dots that jump to a beat, each named "Beat N of 5: {caption}". Space, R and the arrow keys work too; an arrow goes to the start of the previous or next beat. Going to a beat keeps a playing film playing and a paused one paused. `?t=<ms>` opens paused at that moment.
- `?record=1` hides the controls and the shell; the stage header then shows the brand mark, the company name and the "Fictional company" badge.

### Finale

| Part | Text |
| --- | --- |
| Label | Reply time |
| Before | 9 h |
| After | 38 s |
| Link | "Try it yourself", to `/live` with the current `?brand=` |
| Note | A simulation with {company}, a fictional company. Without help, a customer waits 9 h on average until you open at 08:00. |

Both numbers are computed from the fixtures by `domain/metrics.ts` and `formatDurationShort`, never typed in:

- After: the average time from each conversation's first customer message to the first AI reply. (42 + 38 + 36 + 36) / 4 = 38 seconds.
- Before: the average time from each first customer message to 08:00, when the simulated calendar opens. (618 + 586 + 509 + 447) / 4 = 540 minutes = 9 hours.
- The numbers match the diepen.ai site: its Instagram DM arrives at 22:14:00 and gets its answer at 22:14:38, and so does Priya's here. Change a story time and the finale follows, so keep both numbers in line with the site.
- The "before" number is arithmetic on the fictional story, so it makes no claim about any real business.

## 3. Fixtures

All people and companies here are fictional.
Customer emails use `example.com`. The phone number is from the 07700 900 range reserved for fiction.

### Slots

Film text is written with slots so "Make it yours" can swap the company.
No fixture holds the clinic's name, its people or its prices as literal text.
`domain/message-template.ts` fills them from the active `CompanyProfile`.

| Slot | Profile field | Rule |
| --- | --- | --- |
| `{company}` | `name` | As written |
| `{assistant}` | `people.assistantName` | As written |
| `{owner}` | `people.owner.name` | As written |
| `{signOff}` | `voice.signOff` | As written |
| `{serviceA}` | `knowledge.services[0].name` | First letter lowercased, unless the second letter is uppercase too (an acronym) |
| `{ServiceA}` | `knowledge.services[0].name` | First letter uppercased |
| `{aServiceA}` | `knowledge.services[0].name` | `{serviceA}` with "a" or "an" in front, chosen by the first letter (vowel gives "an") |
| `{priceA}` | `knowledge.services[0].price` | Empty when missing |
| `{serviceB}`, `{ServiceB}`, `{priceB}` | `knowledge.services[1]`, falling back to `services[0]` | Same rules as A |
| `{location}` | `knowledge.location` | Empty when missing |
| `{minutes}` | `knowledge.bookingMinutes` | As a number |
| `{handoverMessage}` | `policies.handoverMessage` | As written |
| `{website}` | `website` host, else the company name lowercased with non-letters removed plus `.example` | Shown in the chat widget's page mock |
| `{handle}` | `@` plus the company name lowercased with non-letters removed | The Instagram business handle |

A part in square brackets is optional: it is dropped when any slot inside it is empty.
Example: `[{ServiceA} costs {priceA}. ]` disappears when the first service has no price.

### Story constants

| Name | Value |
| --- | --- |
| Film start | 2026-11-10T21:42:00 (Tuesday), Ana's email |
| Opening time for the "before" metric | 08:00 |
| Calendar day shown | The day of the beat's offer or booking: Thu 12 or Fri 13 November 2026, 08:00 to 12:00 |
| Calendar hours | Monday to Thursday 08:00 to 18:00, Friday 08:00 to 14:00 (the default preset's hours) |
| Slot length | `{minutes}` from the profile (the calendar blocks use it) |

Busy blocks already in the calendar, all labelled "Busy" in grey, so "Booked" keeps meaning a booking the assistant made:

| Day | Busy |
| --- | --- |
| Wed 11 Nov | 08:00 to 12:30, 14:00 to 15:30 |
| Thu 12 Nov | 08:00 to 09:00, 09:30 to 10:30, 11:00 to 13:00 |
| Fri 13 Nov | 08:00 to 10:30, 12:00 to 14:00 |

### Customers

| Ref | Name | Channel | Handle or address | Ends as |
| --- | --- | --- | --- | --- |
| C1 | Ana Ruiz | Email | ana.ruiz@example.com | Booked, Thu 12 Nov 09:00 |
| C2 | Priya Shah | Instagram | @priya.shah.studio | Answered |
| C3 | Tom Becker, Office Manager at Fernhill Architects | LinkedIn | linkedin profile "Tom Becker" | Booked call, Fri 13 Nov 10:30 |
| C4 | Daniel Moore | Website chat | visitor on {website} | Needs a human |

Tom's booking shows in the calendar as "Call with Tom Becker" (`bookingTitle` in `film/fixtures.ts`).

### Messages

`<br>` is a line break inside the message.
Every AI message also carries the structured reply the live mode returns (`InboxReply` from `@diepen/voice/tasks/inbox-reply`), so one renderer serves both modes.
`qualifying` holds the questions the reply asks, as the task defines it.
The style follows the task's channel rules: email greets and signs off, Instagram and chat have no sign-off, the first LinkedIn reply ends with the assistant's name.

| Id | Story time | From | Text | Structured reply |
| --- | --- | --- | --- | --- |
| C1-1 | 21:42:00 | Ana | Hi there,<br>I just moved to the area. Do you have room for someone new? I'd like to book {aServiceA}, but I can only do mornings. How much is it?<br>Thanks,<br>Ana | |
| C1-2 | 21:42:42 | AI | Hi Ana,<br>Welcome to the area, and yes, we have room for you. [{ServiceA} costs {priceA}. ]Is anything urgent, or is this a routine visit? And which mornings suit you best?<br>{signOff} | intent "Price and a first visit", status answered, qualifying ["Is anything urgent, or is this a routine visit?", "Which mornings suit you best?"] |
| C1-3 | 21:44:10 | Ana | Routine, nothing urgent. Wednesday or Thursday morning would be perfect. | |
| C1-4 | 21:44:31 | AI | Wednesday morning is full, but Thursday has two times free: 09:00 or 10:30. Which one should I book for you?<br>{signOff} | intent "Booking", status booking_offered, offeredSlots ["2026-11-12T09:00", "2026-11-12T10:30"] |
| C1-5 | 21:45:05 | Ana | 09:00 please! | |
| C1-6 | 21:45:16 | AI | Your {serviceA} is booked for Thursday 12 November at 09:00[ at {location}]. It's in our calendar, so there's nothing else you need to do. See you on Thursday!<br>{signOff} | intent "Booking", status booked, bookedSlot "2026-11-12T09:00" |
| C2-1 | 22:14:00 | Priya | hi! do you do {serviceB}? how much is it | |
| C2-2 | 22:14:38 | AI | Hi Priya! Yes, we do.[ {ServiceB} is {priceB}.] Is it for a date you have in mind, or whenever suits you? | intent "Asks about {serviceB}", status answered, qualifying ["Is it for a date you have in mind?"] |
| C2-3 | 22:16:40 | Priya | it's for my sister's wedding in march, so no rush. I'll check dates with her and come back to you | |
| C2-4 | 22:16:52 | AI | Congratulations to your sister! Message me here when you have dates and I'll find you a time well before March. | intent "Asks about {serviceB}", status answered |
| C3-1 | 23:31:00 | Tom | Hello, I run the office at Fernhill Architects. We're a team of 14 and we'd like to offer {serviceA} as a staff benefit next year. Do you work with companies? Happy to set up a call. | |
| C3-2 | 23:31:36 | AI | Hi Tom, thanks for getting in touch. Yes, {owner} sets up company arrangements personally. Two quick questions so the call is useful: about how many of the 14 would take part, and would you like one visit day or appointments spread over the year?<br>{assistant} | intent "Company offer for 14 people", status answered, qualifying ["How many of the 14 would take part?", "One visit day or appointments spread over the year?"] |
| C3-3 | 23:33:02 | Tom | Probably 10 to 12. Spread over the year works better for us. | |
| C3-4 | 23:33:20 | AI | Thanks, that helps. {owner} has a {minutes}-minute call free on Thursday or Friday at 10:30. Which day suits you better? | intent "Call with the owner", status booking_offered, offeredSlots ["2026-11-12T10:30", "2026-11-13T10:30"] |
| C3-5 | 23:34:10 | Tom | Friday at 10:30 works. | |
| C3-6 | 23:34:19 | AI | Booked: a call with {owner} on Friday 13 November at 10:30. I've passed on your numbers, so you won't need to repeat them. | intent "Call with the owner", status booked, bookedSlot "2026-11-13T10:30" |
| C4-1 | 00:33:00 | Daniel | Hi. I had {aServiceA} with you on Monday and I'm really not happy with how it went. I'd like a refund. | |
| C4-2 | 00:33:36 | AI | I'm sorry to hear that, Daniel. Refund requests go to {owner}, and I've passed yours on. What's the best way to reach you, here or by phone? | intent "Refund request", status needs_human, handoverReason "Refund request after a visit on Monday" |
| C4-3 | 00:34:20 | Daniel | Phone please. 07700 900123 | |
| C4-4 | 00:34:28 | AI | Thank you, Daniel. {owner} has your number and your message, and will call you back. | intent "Refund request", status needs_human, handoverReason "Refund request after a visit on Monday. Call back on 07700 900123" |

Story times from 00:00 on are 11 November.
C4-2 names the owner, not the profile's handover message: that message offers a severe-pain phone line, which does not answer a refund.
The LinkedIn follow-ups C3-4 and C3-6 carry no signature, as a running LinkedIn conversation does; C3-2 ends with the assistant's name.

### Owner view rows at 08:00

| Order | Channel | Name | Status |
| --- | --- | --- | --- |
| 1 | Website chat | Daniel Moore | Needs a human |
| 2 | LinkedIn | Tom Becker | Booked |
| 3 | Instagram | Priya Shah | Answered |
| 4 | Email | Ana Ruiz | Booked |

Sort rule (`domain/inbox-snapshot.ts`): Needs a human first, then by last activity, newest first.
Live mode adds a summary to each row: `handoverReason`, the booked slot, or `intent`.

## 4. Live mode (`/live`)

The visitor plays the customer.
The page has three parts: the customer side, the owner view and the calendar.

### Channels

- A tab strip switches between Email, Instagram, LinkedIn and Website chat. Each tab keeps its own conversation, so a visitor can run four threads at once.
- Each tab renders the matching mockup from `@diepen/ui/mockups/*` with a composer. Email has a subject field (prefilled "Question") on the first message and a body field. The others have one text field and a Send button.
- Every channel opens in the visitor's own app, because the visitor is the customer. The visitor shows as "You" and the visitor's messages sit on the right. Email shows the visitor's mailbox `you@example.com`; Instagram shows the business (name, `{handle}`, logo) in the header; LinkedIn shows the assistant with the company name as the headline. LinkedIn puts every message on the left under its author's name, as LinkedIn does.
- Under an empty thread, three starter chips: "What does your {serviceA} cost?" ("What are your prices?" when the profile lists no services), "Can I book a time this week?", "I'm not happy with how it went and I'd like a refund." A click sends the text.
- Live mode opens on Email, the first tab, so a phone shows the strip from its start. The active channel tab scrolls into view, and a fade at either edge of the strip shows that more tabs wait there.
- A tab with an unread AI reply shows a dot.

### One turn

1. The visitor sends a message. The thread shows it at once and a typing indicator for the business.
2. The client posts to `/api/reply` with the channel, the profile, the thread, the current bookings, the slots the AI offered last, and the visitor's local time as `now`.
3. The route validates, runs the cost guards, and calls `answerInquiry` through the container.
4. `answerInquiry` computes the free slots with `domain/calendar.ts`, builds the system prompt with `buildSystemPrompt` and `inboxReplyTask`, and calls `AiProvider.generateObject` with role `chat` and `maxTokens` 400. It returns one structured reply: `{ reply, intent, status, handoverReason?, offeredSlots?, bookedSlot?, qualifying? }`.
5. `domain/reply-rules.ts` checks the reply against the calendar before it leaves the server (see Booking).
6. The client appends the reply, shows `replyMs` as "Replied in 1.8 s" under it, updates the conversation's status, the owner view and the calendar.

Without a key, the container slows the mock provider to a typing pace: 0.7 s plus 9 ms per character of the reply, at most 2.4 s (`infrastructure/typing-pace.ts`), so "Replied in" never reads 0.0 s. Under Vitest it adds nothing.

No streaming in this demo: one structured reply per turn, so `text-stream-client` is not used.

### Booking

- The simulated calendar has the same working hours as the film: Monday to Thursday 08:00 to 18:00, Friday 08:00 to 14:00.
- The busy pattern repeats the film's by weekday (Wednesday's film blocks apply to every Wednesday). Monday and Tuesday use Wednesday's blocks.
- Free slots start on the hour or half hour, last `knowledge.bookingMinutes`, start on the next working day after `now`, and cover the next three working days. A slot is free when it overlaps no busy block and no booking.
- The AI gets the first six free slots as `openSlots` in the `inbox-reply` context, with `channel`, `now` and `customerName` "there" (the visitor stays unnamed).
- `offeredSlots` must be a subset of the free slots, with at most three entries.
- `bookedSlot` must be free and must be one of the slots offered in the previous assistant turn.
- An offer of two times is never two slots back to back: `spreadSlots` in `domain/calendar.ts` takes the first free slot and the first free slot on a later day, or one at least two hours later on the same day.
- When a reply breaks either rule, the use case replaces it with status `booking_offered`, the two slots `spreadSlots` picks, and the reply "That time is no longer free. I can offer {slot 1} or {slot 2}. Which one suits you?".
- Under each AI message with `offeredSlots`, the thread shows one chip per slot, for example "Thu 12 Nov, 09:00". A click sends "Thursday 12 November at 09:00 works for me."
- On `booked`, the calendar adds a brand-coloured block "You, {ServiceA}" (or "Call: You" when the intent mentions a call) and the slot leaves the free list.
- Every hour of the calendar is at least 64 px tall, so a 30-minute block holds its time and title on two lines. When the day does not fit, the grid scrolls to the times on offer in the open thread, else to the newest booking.
- Bookings live in page memory only. A reload clears them.

### Handover

- When `status` is `needs_human`, the reply text is the profile's handover message as written by the model, the owner row gets the amber chip "Needs a human" with `handoverReason` as its summary and moves to the top.
- The thread then shows the note "Handed to {owner}. You get a personal reply here." and the composer is replaced by a "Start over" button that clears this channel's thread.
- Slot chips offered before the handover turn grey and can no longer be picked. The shared mockups do this whenever a conversation has a handover, in film and live mode.
- No further request goes to `/api/reply` for a conversation with status `needs_human`.

### Owner view

- One row per channel with at least one message: channel icon, "You on Instagram" (and so on), summary, status chip, time of the last message.
- Same sort rule as the film's owner list.
- Header: "{company}", logo, and "Average first reply: 1.6 s" from the measured `replyMs` of each conversation's first reply.

### Guide

A guide bar at the top of the customer side shows one next step at a time (decision G1): "Step N of 3", one short instruction, and one large button or a brand ring on the times on offer.
`ui/live-guide.ts` works the step out from the live state alone, so a visitor who types their own messages still lands on a step.
The texts below are the defaults; tests check the step ids, never the words.

| Step | Id | When | Instruction | Points at |
| --- | --- | --- | --- | --- |
| 1 | `ask-time` | No booking yet | You play a customer. Ask {company} for an appointment. | Button "Ask for a time": sends "Can I book a time this week?" in the open channel, or in the first channel that still takes messages |
| 2 | `pick-time` | The open thread has times on offer | {assistant} offers some times. Pick one in the answer. | Ring on the offered slot chips |
| 3 | `ask-refund` | A booking, no handover | Booked. Now ask for a refund. A person must answer that. | Button "Ask for a refund": opens the first empty channel (Instagram first) and sends the refund starter there |
| any | `waiting` | The open thread waits for a reply | {assistant} writes an answer | "One moment" |
| End | `end` | A booking and a handover | {assistant} booked your time. The refund went to {owner}, because a person must answer it. | "Start over" (clears every thread and booking) and "Watch the film" |

The guide replaces the line "You write as the customer"; the provider note sits under it.

### Notes on screen

- Keyless mock: when `/api/health` reports `provider: "mock"`, a note above the customer side reads "You see sample answers. The AI is off here.". Decision D4.
- Fictional: while a preset is active, the shell note says "{company} is a fictional company."
- Cost guard: a 429 with `{ fallback: "film" }` sends the visitor to `/?fallback=limit`. The shell shows "Live answers are paused for now. Here is the film." above the film.
- Any other error: the thread shows "No answer this time. Send it again.". The message stays in the thread marked "Not answered", and a typed message also goes back into the composer. The next send replaces the unanswered message, so a retry never shows it twice.

### Mock provider replies

`application/mock-inbox-reply.ts` builds the `mock` for each request.
It reads the last customer message, case-insensitive, and applies the first rule that matches.
Like the model, it hands over what the company knowledge cannot answer, so a sales call never shows a made-up answer.
Every reply uses the profile, so a test can see the brand in it.

| Order | Matches | Status | Reply | Other fields |
| --- | --- | --- | --- | --- |
| 1 | `refund`, `money back`, `reimburse` | needs_human | `policies.handoverMessage` | intent "Refund request", handoverReason "Asked for a refund" |
| 2 | A complaint, with or without the word: `complain`, `not acceptable`, `unacceptable`, `nobody told`, `not happy`, `unhappy`, `disappointed`, `rude`, `waited`, `lawyer`, `legal` and similar | needs_human | `policies.handoverMessage` | intent "Complaint", handoverReason "Raised a complaint" |
| 3 | The request has `offeredSlots` and the message names the `HH:MM` of one of them (and its weekday when two share a time) | booked | "You're booked for {day, date and time of the slot}. It's in our calendar, so there's nothing else you need to do." | intent "Booking", bookedSlot that slot |
| 4 | `opening hours`, `open`, `hours`, `closing` | answered | "Our opening hours: {knowledge.openingHours}. Would you like me to find you a time?" When the profile has no hours ("Not listed on the website."), rule 8 hands over instead | intent "Opening hours" |
| 5 | `book`, `appointment`, `slot`, `available`, `time`, `call`, `when`, `schedule` | booking_offered | "I can offer {slot 1} or {slot 2}. Which one suits you?" | intent "Booking", offeredSlots from `spreadSlots` |
| 6 | `price`, `cost`, `how much`, `fee`, `charge` | answered | "{Service} costs {price}. Would you like me to find you a time?", with the service the message names, else the first. Without a price: "Prices depend on what you need, so {owner} gives you a personal quote. Would you like me to find you a time?" | intent "Price question", qualifying ["Asked about price"] |
| 7 | The message names a service, or shares two key words with an FAQ question | answered | "Yes, we offer {service}. {description} It costs {price}. Would you like me to find you a time?", or the FAQ answer | intent "Asks about {service}" or "Question" |
| 8 | Any other question (a question mark, or a first word such as "do", "can", "what") | needs_human | `policies.handoverMessage` | intent "Question outside the company knowledge", handoverReason the profile's `handoverWhen` rule about the company knowledge, else "The company knowledge does not answer this question" |
| 9 | anything else | answered | "Thanks for writing to {company}. I'm {assistant}, and I can answer your questions or find you a time. What can I help with?" | intent "General question" |

Every reply is framed for its channel: an email starts with "Hi there," and ends with `voice.signOff`, a LinkedIn message ends with the assistant's name, Instagram and chat send the text alone (`application/mock-reply-wording.ts`).
Every sentence is written so it reads well for any profile: no services, no prices, no hours, an owner called "the team" or a long company name.

Slots in mock replies are formatted by `formatSlot` in `domain/calendar.ts`, for example "Thursday 12 November at 09:00".

## 5. Make it yours

The "Make it yours" panel from `@diepen/ui/brand/*` sits in the shell header on `/` and `/live`.
It offers the three fictional presets, a website field that posts to `/api/brand`, and the edit form.
Applying a profile writes it to `?brand=` and local storage (decision S3).

The film never changes (decision F1): applying a profile on `/` opens live mode in that profile.

What changes in live mode:

| Part | Live |
| --- | --- |
| Company name, assistant name, owner name | Owner view header, business side of every channel, prompts, mock replies |
| Logo | Owner view header, chat widget header, Instagram and LinkedIn business avatars |
| Colours | Booked calendar blocks, chat widget header, slot chips, buttons |
| Services and prices | The model answers from `knowledge`; the mock uses `services[0]` |
| Voice (tone, words, sign-off) | Full: the system prompt carries tone, words to use and avoid |
| Policies | Full: `handoverWhen` decides handovers |
| Location, booking length | Slot length in the calendar |
| Fictional note | The shell note disappears when `fictional` is false |

Rules:

- Film message texts that name the clinic, its people, its services or its prices are templates (section 3, "Slots"). A unit check proves no fixture holds the default preset's name.
- A URL logo renders as an image 32 px high with the company name as alt text. If it fails to load, a monogram of the company initials takes its place.
- In live mode, applying a profile clears all four threads and the bookings, so no thread mixes two companies.
- The film never calls the network for a profile. Voice beyond the slots shows in live mode.

## 6. Architecture

Paths are inside `apps/inbox/`.
Dependencies point inwards only, as `AGENTS.md` sets out.

### domain/

| File | Holds |
| --- | --- |
| `domain/channel.ts` | `Channel` (`email`, `instagram`, `linkedin`, `chat`), its zod schema and display labels |
| `domain/conversation.ts` | `Message` (role `customer` or `assistant`, text, story time, optional structured reply), `Conversation`, zod schemas, `firstReplySeconds` |
| `domain/conversation-status.ts` | `ConversationStatus`, its labels, `applyReply` (statuses move forward; `needs_human` is sticky), `acceptsReplies` |
| `domain/calendar.ts` | Working hours, the weekday busy pattern, `freeSlots(now, bookings, minutes)`, `spreadSlots`, `formatSlot`, `formatSlotChip` |
| `domain/reply-rules.ts` | `checkReply(reply, free, lastOffered)`: offered slots within free, at most three, booked slot free and offered, the fallback reply when not |
| `domain/message-limits.ts` | `maxCustomerMessageChars` (1000: the composer counts down over the last 100 and stops there), `maxAssistantMessageChars` (2000) and `clipAssistantText`, which live mode applies to earlier answers before it sends them back |
| `domain/metrics.ts` | `averageFirstReplySeconds`, `averageWaitUntilOpening(conversations, "08:00")`, `countByStatus`, `formatDuration` ("38 seconds", "9 hours") |
| `domain/message-template.ts` | `fillTemplate(text, profile)`: the slots, the optional parts in brackets, the a or an rule, the case rules |
| `domain/inbox-snapshot.ts` | The views both modes draw from: `ThreadView`, `CalendarBlock`, `OwnerRow`; `sortOwnerRows` and the live `ownerSummary` |
| `domain/wall-clock.ts` | Reads and writes wall-clock times such as "2026-11-12T09:00" as written, so no time zone moves them |

### application/

| File | Holds |
| --- | --- |
| `application/answer-inquiry.ts` | `answerInquiry({ ai }, input)`: free slots, prompt through `buildSystemPrompt` and the `inbox-reply` task, one `generateObject` call with role `chat`, then `checkReply`. Returns the reply and `replyMs` |
| `application/mock-inbox-reply.ts` | The deterministic mock reply rules from section 4 |
| `application/mock-reply-wording.ts` | How each channel frames a mock reply, and the key-word match against services and the FAQ |
| `application/inquiry.ts` | `Inquiry`, the input of `answerInquiry` |

No `application/ports/`: the only port is `AiProvider` from `@diepen/ai/provider`, passed as a parameter.

### infrastructure/

| File | Holds |
| --- | --- |
| `infrastructure/typing-pace.ts` | Slows the mock provider to a typing pace in keyless live mode |
| `infrastructure/container.ts` | `createContainer({ provider?, guards? })` and the app's `container`. Takes the provider from `getProvider()` in `@diepen/ai` (mock when `AI_PROVIDER=mock` or no key) and the shared `guards`, picks the page fetcher for "Make it yours" with `pageFetcherFor` from `@diepen/voice/fixture-page-fetcher` (a fixture page under the mock provider), and exposes `answerInquiry`, `guards`, `fetchPage` and `providerName`. Tests build a container with their own provider and guard limits |

### film/

| File | Holds |
| --- | --- |
| `film/fixtures.ts` | Customers, messages with their structured replies, story constants (section 3) |
| `film/inbox-keynote.tsx` | `buildInboxKeynote(profile)`: the `KeynoteFilm` of section 2 through `defineKeynoteFilm`, with the finale numbers from `domain/metrics.ts` |

### ui/

| File | Holds |
| --- | --- |
| `ui/channel-thread.tsx` | Live mode: the mockup for a channel as the customer sees it, with messages, slot chips, handover note and composer |
| `ui/channel-tab-strip.tsx` | The channel tabs with the active tab scrolled into view |
| `ui/use-phone-fit.ts` | Live mode below 768 px: the customer part ends right above the bottom tab bar, so the page never scrolls the composer under it |
| `ui/owner-view.tsx` | Live owner view: header, filter chips with counts, the list |
| `ui/calendar-view.tsx` | The three-day calendar with busy, offered and booked blocks; one day at a time with a day switcher below 768 px in live mode. Blocks are exactly as long as their time |
| `ui/use-hour-grid.ts` | The calendar's hour height: the whole working day when it fits, else 64 px hours and a scroll to the blocks in focus, starting on a whole hour |
| `ui/owner-row.tsx` | One live owner row: channel, name, last activity, summary, status |
| `ui/channel-mark.tsx` | The small coloured channel square |
| `ui/status-chip.tsx` | Status chip with label and semantic colour |
| `ui/starter-prompts.ts` | The three starter texts; the shared `StarterChips` draws them |
| `ui/live-inbox.tsx` | The live page body: layout, guide, tabs, mobile tab bar |
| `ui/live-guide.ts` | `inboxGuide(state, names)`: the guide's current step from the live state, and the channels its two buttons write in |
| `ui/inbox-guide-bar.tsx` | The guide bar: the step from `live-guide.ts` with its button on the shared `GuideBar` |
| `ui/live-part-tabs.tsx` | The bottom tab bar below 768 px |
| `ui/live-snapshot.ts` | Owner rows, calendar blocks and thread views from the live state |
| `ui/use-visitor-now.ts` | The visitor's clock, read in the browser only |
| `ui/live-inbox-state.ts` | The client reducer: send, reply, book, hand over, start over, reset on profile change |
| `ui/reply-client.ts` | Posts to `/api/reply`, parses the response with zod, maps a tripped cost guard (`isGuardTrip`) to the film fallback and anything else to an error the visitor sends again. The reply time shown is the round trip the visitor waited |

### app/

| Route | Does |
| --- | --- |
| `app/layout.tsx` | Fonts and global styles. `/favicon.ico` is rewritten to the app icon in `next.config.ts` |
| `app/page.tsx` (`/`) | The brand provider and the demo shell in Film mode with `KeynoteFilmView` and the inbox keynote built from the preset. Reads `?t=` (film ms), `?brand=`, `?record=1` |
| `app/live/page.tsx` (`/live`) | The demo shell in Live mode with `live-inbox` |
| `app/api/reply/route.ts` | POST. Validates, runs guards, calls `answerInquiry` through the container |
| `app/api/reply/reply-request.ts` | The zod schema for the request, read with `readBodyText` from `@diepen/ai/request-body` so the 48 KB cap holds while the body streams in |
| `app/api/brand/route.ts` | POST. `createBrandHandler` from `@diepen/voice/brand-route` with the container's page fetcher, so the mock run never fetches a real page |
| `app/api/health/route.ts` | GET. Returns the app name and the provider name |

`POST /api/reply` request, validated with zod, body at most 48 KB:

```ts
{
  channel: "email" | "instagram" | "linkedin" | "chat";
  profile: CompanyProfile; // companyProfileSchema
  messages: { role: "customer" | "assistant"; text: string }[]; // 1 to 20, customer text 1 to 1000 chars, assistant text 1 to 2000 chars (`domain/message-limits.ts`), last role "customer"
  bookings: string[]; // "YYYY-MM-DDTHH:mm", at most 20
  offeredSlots: string[]; // from the last assistant turn, at most 3
  now: string; // visitor's local time, "YYYY-MM-DDTHH:mm"
}
```

Responses:

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ reply: InboxReply, provider: "claude" \| "mock", replyMs: number }` | A reply |
| 400 | `{ error: "invalid_request", issues: ZodIssue[] }` | Validation failed |
| 429 | `{ fallback: "film" }` | A cost guard tripped |
| 503 | `{ fallback: "film", reason: "unavailable" }` | The provider threw (`unavailableResponse` from `@diepen/ai/route-responses`, the one shape every app uses). The visitor stays: the thread shows "No answer this time. Send it again." |

`POST /api/brand`: the shape `createBrandHandler` from `@diepen/voice/brand-route` defines. Every error is `{ message }`, shown in the "Make it yours" panel; a tripped guard answers 429 "Live answers are paused for now. Fill in the form instead." and the visitor stays in the panel.

`GET /api/health`: `{ ok: true, app: "inbox", provider: "claude" | "mock" }`.

## 7. Layout

| Viewport | Film (`/`) | Live (`/live`) |
| --- | --- | --- |
| 1920x1080 at 150 % zoom, for recording (lays out at 1280x720, `?record=1`) | Stage header: brand mark, company name, "Fictional company" badge. The caption centred, at most 60 px, the element under it, then the chip. The step dots at the bottom; no other controls | Content max 1600 px wide. Customer side left (55 %), owner view top right (two fifths of the height), calendar bottom right (three fifths) |
| 1440x900 | The shell header on top, then the stage in the rest of the screen: caption, element, chip, and Play with the step dots at the bottom | Same as 1920 at full width with 32 px gutters |
| 375 px wide | The stage takes the height under the shell header. Caption at least 30 px, the element at full width inside the 24 px gutters, Play and the step dots 44 px tall at the bottom. The finale wraps its number when it has to | A bottom tab bar: "Customer", "Owner view", "Calendar", with a dot when the hidden part changes. The customer part ends right above the bar. The calendar day buttons are 44 px. The channel tab strip scrolls sideways inside itself. Calendar shows one day with a day switcher |

At every width:

- Nothing may overflow the page horizontally. `document.documentElement.scrollWidth` is at most the viewport width.
- Long words (email addresses, URLs, a long company name) wrap with `overflow-wrap: anywhere`.
- The page has a 16 px side gutter at 375 px.

## 8. Acceptance checks

Run every check with `pnpm check`.
Run one flow against the running app with `VERIFY_APP=inbox pnpm verify flow <feature id>`. Playwright tests carry the tag `@<feature id>` in their title.
Unit tests sit next to their module as `*.test.ts`. Flow tests sit in `apps/inbox/e2e/`.
Flows fix the browser clock with `page.clock.install({ time: new Date("2026-11-10T21:42:00") })` so free slots are the same on every run.
`?t=` is in film milliseconds, as `startFromSearch` in `@diepen/ui/film/film-playback` reads it.
Prefer roles and visible text as selectors. Test ids where text is not stable: `data-keynote-step` (the step index on screen) and `data-keynote-finale` on the film, `data-testid="owner-row"` with `data-channel`, `status-chip`, `calendar-booking`, `provider-note`, `slot-chip`.

### Unit checks (Vitest)

| Check | Feature | Assertion |
| --- | --- | --- |
| U1 | `inbox.live-booking` | `freeSlots` with `now` Tue 10 Nov 21:42 and 30-minute slots returns only Wed to Fri slots between 08:00 and 18:00, none overlapping a busy block, first slot Wed 11 Nov 12:30 |
| U2 | `inbox.live-booking` | `freeSlots` with `now` Friday 18:30 starts on Monday; a booked slot is no longer free |
| U3 | `inbox.live-booking` | `checkReply` keeps a valid offer and booking; it turns a booked slot that is not free, or was not offered, into `booking_offered` with two slots from `spreadSlots`; it cuts offers to at most three. `spreadSlots` never offers two slots back to back |
| U4 | `inbox.live-handover` | `applyReply` moves answered to booking_offered to booked; after `needs_human` every later reply keeps `needs_human`, and `acceptsReplies` is false |
| U5 | `inbox.film` | `metrics` on the fixtures: average first reply 38 seconds, average wait until 08:00 is 540 minutes, `formatDurationShort(38)` is "38 s", `formatDurationShort(32400)` is "9 h", counts booked 2, answered 1, needs_human 1 |
| U6 | `inbox.film` | `buildInboxKeynote` with each preset: 4 beats, every caption at most 6 words, the finale reads 9 h to 38 s; `priyaReplySeconds()` is 38, the answered beat reads "Answered in 38 seconds." and has no chip |
| U9 | `inbox.make-it-yours` | `fillTemplate` replaces every slot, drops an optional part with an empty slot, writes "an" before a vowel, lowercases the first letter unless the second is uppercase; with each preset, no fixture text keeps a `{` or `[` |
| U10 | `inbox.make-it-yours` | No fixture text contains the default preset's company name, owner name or any of its prices as literal text |
| U11 | `inbox.live-chat` | `answerInquiry` with the mock provider: "How much is it?" gives `answered` with the first service's price in the reply; "Can I book?" gives `booking_offered` with two free slots; a message with the `HH:MM` of an offered slot gives `booked` with that slot; "I want a refund" gives `needs_human`, a `handoverReason`, and the profile's handover message |
| U12 | `inbox.live-chat` | `answerInquiry` calls the provider once with role `chat`, a system prompt that contains the company name, and at most 20 messages; a stub provider that returns an invalid booked slot ends as `booking_offered` |
| U13 | `inbox.live-chat` | `POST /api/reply` returns 400 for a missing profile, an unknown channel, no messages, a last message from the assistant, a customer message over 1000 characters, an earlier answer over 2000 characters (and accepts one of 1800), more than 20 messages, and a body over 48 KB, and stops reading a streamed body with no declared length at 32 KB |
| U14 | `inbox.limit-fallback` | `POST /api/reply` with a container whose daily cap is 0 returns 429 and `{ fallback: "film" }`, and the provider is never called |
| U15 | `inbox.live-chat` | `GET /api/health` returns `provider: "mock"` under `AI_PROVIDER=mock` |
| U16 | `inbox.film` | Fixtures: every customer email ends in `@example.com`, every phone number starts with `07700 900` |
| U17 | `inbox.live-chat` | Mock replies: a complaint without the word "complaint" hands over; "Do you treat dogs?" hands over by the profile's knowledge rule; a FAQ question gets its answer; a booking offer spans two days; an email greets and signs off; a profile with no services, prices or hours and an owner called "the team" gets sentences that read well. Starters ask "What are your prices?" without services |
| U18 | `inbox.guide` | `inboxGuide` returns each row of the guide table in section 4; the refund goes to Instagram first, and "Ask for a time" skips a channel that was handed over |

### Flow checks (Playwright, mock provider, desktop and phone projects)

| Check | Feature | Steps and assertion |
| --- | --- | --- |
| F1 | `inbox.film` | Open `/?t=14400`. The finale shows "Reply time", "9 h", "38 s" and the "Try it yourself" link |
| F3 | `inbox.film-controls` | Open `/?t=` at the middle of each step (1600, 4800, 8000, 11200, 14400 ms). `[data-keynote-step]` reads 0 to 4 in order, and each beat shows its caption from section 2 |
| F5 | `inbox.owner-view` | Covered by F9: after a refund request on Instagram and a newer question on Email, the live owner view lists the Instagram row, "Needs a human", first |
| F6 | `inbox.live-chat` | On `/live`, on each of the four channel tabs, send "What are your opening hours?". An assistant message appears in that tab's thread and the owner view has a row for that channel with "Answered" |
| F7 | `inbox.live-chat` | On `/live` the provider note reads "You see sample answers. The AI is off here." |
| F8 | `inbox.live-booking` | On `/live`, Website chat: send "Can I book an appointment?". Two slot chips appear, Wed 11 Nov 12:30 and Thu 12 Nov 09:00. Click the first. The reply says the booking, a calendar block with that time appears, and the owner row shows "Booked" |
| F9 | `inbox.live-handover` | On `/live`, Instagram: send "I'm not happy with how it went and I'd like a refund." The reply contains the preset's handover message, the owner row shows "Needs a human" at the top, the composer is replaced by "Start over", and no further request to `/api/reply` is made. "Start over" clears the thread |
| F10 | `inbox.limit-fallback` | On `/live`, route `/api/reply` to answer 429 `{ fallback: "film" }`. After sending a message the page is `/` with the note "Live answers are paused for now. Here is the film." and the film stage visible |
| F11 | `inbox.make-it-yours` | On `/`, open "Make it yours" and pick the property manager preset: live mode opens in that company and the brand CSS variable changes. With that preset saved, the film finale keeps its own company and colour (decision F1). On `/live` after the same step, a reply mentions the new company name |
| F12 | `inbox.make-it-yours` | Open `/?t=14400&brand=<encoded test profile>` (a fictional plumbing company in `e2e/fixtures/test-profile.ts`, `fictional: false`). The finale keeps the default preset's name, and "Try it yourself" links to `/live?brand=<same>`. `/live?brand=<same>` shows the name in the owner view header and in a mock reply |
| F13 | `inbox.make-it-yours` | In the panel, enter `https://example.com`, apply. The mock profile from `/api/brand` is applied (its name shows in the owner view header); under the mock provider the container's fixture page fetcher answers, so no request leaves the server |
| F14 | `inbox.film`, `inbox.live-chat` | At 375 px wide, on `/?t=1600` (the first beat), `/?t=14400` (the finale), and `/live` on each bottom tab and each channel tab, `document.documentElement.scrollWidth` is at most 375 |
| F15 | `inbox.film`, `inbox.live-chat` | No console errors and no failed requests on `/` while it plays to the second beat, and on `/live` after one sent message |
| F17 | `inbox.live-handover` | On `/live`, Website chat: ask to book, then complain without the word "complaint". The thread hands over and the earlier slot chips are no longer buttons and carry the shared inactive look (`data-disabled`) |
| F18 | `inbox.live-chat` | On `/live`, with `/api/reply` failing, click a starter. The message stays in the thread marked "Not answered"; sending it again shows it once |
| F19 | `inbox.film` | `/?record=1` shows the company name and "Fictional company" in the stage header |
| F20 | `inbox.guide` | On `/live` the guide starts on `ask-time`; its button, then the ring on the offered times, then its button again walk `ask-time`, `pick-time`, `ask-refund` to `end`, which links to the film; "Start over" returns to `ask-time` |

## 9. Feature rows

| Id | A user can | Reach it | As | Status |
| --- | --- | --- | --- | --- |
| `inbox.film` | Watch a 16-second film, one element per beat, of an after-hours DM answered in 38 seconds, a booking and a refund handed over, ending on reply time: 9 h before, 38 s now | `/` | anon | shipped |
| `inbox.film-controls` | Pause, replay or jump to a step of the film, or open it at a moment with `?t=` in ms | `/`, Play and the step dots under the stage | anon | shipped |
| `inbox.owner-view` | See every conversation with its status, needs a human first | `/live`, "Owner view" | anon | shipped |
| `inbox.live-chat` | Write as a customer on email, Instagram, LinkedIn or website chat and get an answer in the company's voice | `/live`, channel tabs | anon | shipped |
| `inbox.live-booking` | Book a slot the AI offers and see it in the calendar | `/live`, "Can I book a time this week?", then a slot chip | anon | shipped |
| `inbox.live-handover` | Ask for a refund, complain, or ask what the company knowledge cannot answer, and see the conversation handed to the owner as "Needs a human" | `/live`, "I'm not happy with how it went and I'd like a refund." | anon | shipped |
| `inbox.limit-fallback` | See the film with a short note when live answers hit a limit | `/live`, then `/?fallback=limit` | anon | shipped |
| `inbox.guide` | Follow one guided step at a time: ask for a time, pick one, ask for a refund, then start over or watch the film | `/live`, the guide bar | anon | shipped |
| `inbox.make-it-yours` | Switch the film and live mode to a preset, a website or a `?brand=` profile | `/`, "Make it yours"; also on `/live` | anon | shipped |

## 10. Open questions

Each has the default this plan uses.
They belong in `docs/decisions.md`; this file does not edit it.

| Question | Default |
| --- | --- |
| The default preset (Ottervale Dental) may change its names, services or prices | The film uses slots only, so it follows the preset. Service A is "Check-up and consultation", service B "Professional teeth cleaning" today |
| `CompanyProfile` has no structured opening hours, only text | The simulated calendar uses the default preset's hours (Monday to Thursday 08:00 to 18:00, Friday 08:00 to 14:00) for every profile, and the "before" number uses 08:00. A visitor's own hours show only in replies |
| The film's policy line says refunds go to the owner even if a visitor's profile says something else (the default preset does list refunds) | Keep the fixed line. Live mode follows the profile's `handoverWhen` |
| Should "Make it yours" rewrite the film's replies in the visitor's voice with Claude? | No. The film runs with no network; voice shows in live mode |
| Can a visitor keep chatting after a handover? | No. The thread shows the handover note and "Start over" |
| Live threads and bookings after a reload | Kept in page memory only; a reload starts empty |
| Which clock is "now" in live mode? | The visitor's local clock, sent with each request |
| Applying a profile in live mode | Clears all threads and bookings |
| Recording without shell controls | A `?record=1` parameter hides the shell header and the film controls; the stage header then shows the brand mark and "Fictional company" |
| The `inbox-reply` context needs a customer name, and a live visitor has none | Pass "there", so an email greets "Hi there" |
| Service names that read badly mid-sentence (plurals, proper nouns) | Accept it; preset service names are written in sentence case so they read inside a sentence |
