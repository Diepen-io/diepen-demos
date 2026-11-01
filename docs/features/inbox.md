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
It is 86 seconds long: 76 seconds of story and 10 seconds of end card.
It plays one night at a fictional dental clinic, from Tuesday 10 November 2026 at 21:40 to Wednesday 11 November at 08:01.
The film always tells Ottervale Dental's story (decision F1).
Four customers write on four channels while the clinic is closed.

### Lanes

| Lane id | Label on screen | What it shows |
| --- | --- | --- |
| `customers` | Customers, with the role "4 channels" | A channel tab strip (Email, Instagram, LinkedIn, Website chat) over the mockup of the active channel, with the thread as the customer sees it |
| `ai` | {assistant}, with the subtitle "AI assistant" | One card per conversation: channel icon, customer name, intent, qualifying facts as tags, status chip, "Replied in 42 s", and on a handover the policy line |
| `calendar` | Calendar, with the role "Bookings" | A three-day week view, Wed 11 to Fri 13 November, 08:00 to 18:00, with busy, offered and booked blocks. When the lane is too short for the whole day, it scrolls to the blocks that changed last |
| `owner` | {owner}, with the role "Owner view" | The list a business owner opens in the morning: one row per conversation with channel, name, one-line summary and status |

Why these four: the customer's channel UI and the customer are one lane, because a separate "Channels" lane would show every message twice.
The AI lane shows the decision an owner wants to understand (what it read, what it decided, why it handed over).
The calendar lane makes a booking visible as a result, and the owner lane is the payoff: the morning view.

Lane widths at 16:9: Customers 35 %, AI 18 %, Calendar 26 %, Owner 21 %. The calendar gets the room a booked block needs for its time and name on two lines.

### Rules for the script

- Every beat row is a clock keyframe (`FilmClockKeyframe`, curve `linear`), so story times never go down. The jump at 64000 ms uses curve `ease`.
- Travel starts at the beat's film time and lands in the beat's lane after the engine's default 800 ms. Kinds: `message` (a chat bubble), `document` (a note card), `event` (a small pill). The travel label is the message id's short text, for example "Email from Ana".
- A caption stays on screen until the next caption replaces it. "(keeps)" means no new caption.
- Captions are templates. Slots in braces come from the active profile (section 3, "Slots"). The engine takes plain strings, so `buildInboxFilm(profile)` fills every caption, lane label and end card line before it hands the script to `FilmStage`.
- A filled caption is at most 60 characters with every preset. Captions use {owner} and {assistant} and leave the company name to the lanes, because "Brickfern Property Management" alone takes half the limit.
- Status labels on screen: `answered` is "Answered", `booking_offered` is "Slot offered", `booked` is "Booked", `needs_human` is "Needs a human".
- Status chip colours are semantic, not brand: Answered zinc, Slot offered blue, Booked green, Needs a human amber.
- Under `prefers-reduced-motion` travel is replaced by a 150 ms fade at the target; beats and the clock run the same.
- Thread panes show whole messages: the newest message is always fully in view, and the pane starts at the first message that fits whole (`ui/use-whole-messages.ts`).
- While the AI card says "Writing a reply", its status chip waits for the reply.
- A customer message lands in its thread at its row's time. A second beat 300 to 400 ms later carries it to the AI lane, so the travelling token leaves a thread that already shows the message. `film/film-beats.ts` holds every beat, these included.

### Beats

Times in the clock column are local story time on 10 November until 23:59, then on 11 November.
Message ids (C1-1 and so on) point to section 3.

| Film ms | Lane | What appears | Travel | Story clock | Caption |
| --- | --- | --- | --- | --- | --- |
| 0 | all | Lanes fade in. Customers shows the Email tab with the inbox list: three emails read before closing. AI lane says "Waiting for messages". Calendar shows the busy blocks. Owner view header "{company}" with the badge "Closed until 08:00" and the text "No conversations yet" | none | 21:40:00 | Closed for the night. Messages keep coming. |
| 3000 | customers | C1-1 lands at the top of the inbox and opens | none | 21:42:00 | An email from Ana. She wants a morning slot. |
| 4500 | ai | Card "Email, Ana Ruiz" with intent "Price and a first visit" and a typing indicator | customers to ai, message | 21:42:10 | (keeps) |
| 7000 | customers | C1-2 appears in the thread. AI card shows "Replied in 42 s", tags "New customer", "Mornings only", chip Answered | ai to customers, message | 21:42:42 | {assistant} replies in 42 seconds. |
| 7600 | owner | Row: Email, Ana Ruiz, "Price and a first visit", Answered | ai to owner, event | 21:42:45 | (keeps) |
| 11000 | customers | C1-3 appears | none | 21:44:10 | (keeps) |
| 12000 | ai | Card adds tags "Routine visit", "Wed or Thu morning" | customers to ai, message | 21:44:20 | (keeps) |
| 13500 | calendar | Dashed outlines on Thu 12 Nov 09:00 and 10:30 | ai to calendar, event | 21:44:28 | It checks the calendar for free mornings. |
| 14500 | customers | C1-4 appears with two slot chips. AI card chip Slot offered. Owner row chip Slot offered | ai to customers, message | 21:44:31 | (keeps) |
| 17500 | customers | C1-5 appears with the picked chip "Thu 12 Nov, 09:00"; the 09:00 chip under C1-4 shows as picked | customers to ai, message | 21:45:05 | (keeps) |
| 19000 | calendar | Thu 09:00 fills in brand colour: "Ana Ruiz". The 10:30 outline fades | ai to calendar, event | 21:45:14 | Booked. Thursday 09:00 is in the calendar. |
| 20000 | customers | C1-6 appears. AI card chip Booked | ai to customers, message | 21:45:16 | (keeps) |
| 21000 | owner | Ana's row: "Booked, Thu 12 Nov 09:00", chip Booked | ai to owner, event | 21:45:18 | (keeps) |
| 24000 | customers | Tab switches to Instagram. C2-1 from Priya Shah (@priya.shah.studio) | none | 22:14:00 | Instagram at 22:14. Priya asks for a price. |
| 25200 | ai | Card "Instagram, Priya Shah" with intent "Asks about {serviceB}" | customers to ai, message | 22:14:08 | (keeps) |
| 27000 | customers | C2-2 appears. AI card "Replied in 38 s", chip Answered | ai to customers, message | 22:14:38 | The price and one question, 38 seconds later. |
| 27600 | owner | Row: Instagram, Priya Shah, "Asks about {serviceB}", Answered | ai to owner, event | 22:14:40 | (keeps) |
| 30000 | customers | C2-3 appears | customers to ai, message | 22:16:40 | (keeps) |
| 32500 | customers | C2-4 appears. AI card tag "Wants a date before March" | ai to customers, message | 22:16:52 | Priya has no date yet. The thread stays open. |
| 33200 | owner | Priya's row summary: "Wants {serviceB} before March", chip Answered | ai to owner, event | 22:16:54 | (keeps) |
| 36000 | customers | Tab switches to LinkedIn. C3-1 from Tom Becker, Office Manager at Fernhill Architects | none | 23:31:00 | LinkedIn at 23:31. A team of 14 asks. |
| 37200 | ai | Card "LinkedIn, Tom Becker" with intent "Company offer for 14 people" | customers to ai, message | 23:31:10 | (keeps) |
| 39500 | customers | C3-2 appears. AI card "Replied in 36 s", chip Answered | ai to customers, message | 23:31:36 | Two questions so {owner} gets a useful call. |
| 40100 | owner | Row: LinkedIn, Tom Becker, "Company offer for 14 people", Answered | ai to owner, event | 23:31:38 | (keeps) |
| 43000 | customers | C3-3 appears. AI card tags "10 to 12 people", "Spread over the year" | customers to ai, message | 23:33:02 | (keeps) |
| 44200 | calendar | Dashed outlines labelled "Call" on Thu 12 Nov 10:30 and Fri 13 Nov 10:30 | ai to calendar, event | 23:33:15 | (keeps) |
| 45200 | customers | C3-4 appears with two slot chips. Chips Slot offered in AI card and owner row | ai to customers, message | 23:33:20 | It offers two times for a call with {owner}. |
| 47800 | customers | C3-5 appears with the picked chip "Fri 13 Nov, 10:30" | customers to ai, message | 23:34:10 | (keeps) |
| 49000 | calendar | Fri 10:30 fills: "Tom Becker". The Thu 10:30 outline fades | ai to calendar, event | 23:34:16 | A call with {owner}, booked for Friday. |
| 49800 | customers | C3-6 appears. AI card chip Booked | ai to customers, message | 23:34:19 | (keeps) |
| 50600 | owner | Tom's row: "Call booked, Fri 13 Nov 10:30. 10 to 12 people, spread over the year", chip Booked | ai to owner, document | 23:34:21 | (keeps) |
| 53000 | customers | Tab switches to Website chat: the chat widget open on a page of {website}. C4-1 from Daniel Moore | none | 00:33:00 | After midnight, website chat. Daniel wants a refund. |
| 54200 | ai | Card "Website chat, Daniel Moore", intent "Refund request". Amber policy line "Policy: refunds go to {owner}". The chip Needs a human shows once the reply lands | customers to ai, message | 00:33:08 | The policy says refunds go to {owner}. |
| 56000 | customers | C4-2 appears. AI card "Replied in 36 s" | ai to customers, message | 00:33:36 | (keeps) |
| 56800 | owner | Row: Website chat, Daniel Moore, "Refund request after a visit on Monday", chip Needs a human. The row moves to the top and gets an amber edge | ai to owner, message | 00:33:38 | {owner} gets the thread, marked Needs a human. |
| 59500 | customers | C4-3 appears | customers to ai, message | 00:34:20 | (keeps) |
| 61000 | customers | C4-4 appears. The widget shows the note "Handed to {owner}" | ai to customers, message | 00:34:28 | (keeps) |
| 61800 | owner | Daniel's row adds "Call back on 07700 900123" | ai to owner, event | 00:34:30 | (keeps) |
| 64000 | owner | The clock jumps to 08:00. Badge "Open". Other lanes dim to 40 %. Owner view in order: Daniel (Needs a human), Tom (Booked), Priya (Answered), Ana (Booked). Filter chips: "Needs a human 1", "Booked 2", "Answered 1" | none | 08:00:00 | 08:00. Every conversation, in one list. |
| 68000 | owner | A cursor clicks Daniel's row. The detail opens: handover reason, the chat thread (it scrolls inside the row and opens on the latest messages) and a "Call 07700 900123" button | none | 08:00:30 | The refund is on top, with the whole thread. |
| 72000 | calendar | Calendar returns to full opacity and the two booked blocks pulse once. The owner closes Daniel's row and the "Booked 2" filter shows Tom and Ana | none | 08:01:00 | Two bookings made overnight, ready at 08:00. |
| 76000 | stage | End card fades in over the stage | none | 08:01:00 | (end card, no caption) |
| 86000 | stage | Film ends. Controls show Restart | none | 08:01:00 | (none) |

### End card

| Part | Text |
| --- | --- |
| Metric | Reply time |
| Before | 9 hours |
| After | 38 seconds |
| Supporting line 1 | 2 bookings while {company} was closed: one appointment, one call with {owner}. |
| Supporting line 2 | 1 refund request waiting for {owner}, with the full thread. |
| Supporting line 3 | 4 of 4 messages answered before 08:00. |
| Fictional note, preset profile | A simulation. {company} and everyone in it are fictional. "Before" is how long these four messages would wait for the 08:00 opening. |
| Fictional note, own profile | A simulation in {company}'s brand. The customers and messages are fictional. "Before" is how long these four messages would wait for the 08:00 opening. |

Both numbers are computed from the fixtures by `domain/metrics.ts`, never typed in:

- After: the average time from each conversation's first customer message to the first AI reply. (42 + 38 + 36 + 36) / 4 = 38 seconds.
- Before: the average time from each first customer message to 08:00, when the simulated calendar opens. (618 + 586 + 509 + 447) / 4 = 540 minutes = 9 hours.
- The numbers match the diepen.ai site: its Instagram DM arrives at 22:14:00 and gets its answer at 22:14:38, and so does Priya's here. Change a story time and the end card follows, so keep both numbers in line with the site.
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
| Story start | 2026-11-10T21:40:00 (Tuesday) |
| Opening time for the "before" metric | 08:00 |
| Calendar days shown | Wed 11, Thu 12, Fri 13 November 2026 |
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

Before Ana writes, the inbox list holds three emails read that afternoon (`earlierEmails` in `film/fixtures.ts`), so the Email tab never opens empty.
The business side shows `knowledge.contactEmail` as the inbox address, `{handle}` on Instagram, the company page "{company}" on LinkedIn and the widget header "{company}" with the logo.

### Messages

`<br>` is a line break inside the message.
Every AI message also carries the structured reply the live mode returns (`InboxReply` from `@diepen/voice/tasks/inbox-reply`), so one renderer serves both modes.
`qualifying` holds the questions the reply asks, as the task defines it.
`notes` is film-only data: the facts the AI lane shows as tags and the owner view adds to a summary.
The style follows the task's channel rules: email greets and signs off, Instagram and chat have no sign-off, the first LinkedIn reply ends with the assistant's name.

| Id | Story time | From | Text | Structured reply |
| --- | --- | --- | --- | --- |
| C1-1 | 21:42:00 | Ana | Subject: Room for someone new?<br>Hi there,<br>I just moved to the area. Do you have room for someone new? I'd like to book {aServiceA}, but I can only do mornings. How much is it?<br>Thanks,<br>Ana | |
| C1-2 | 21:42:42 | AI | Subject: Re: Room for someone new?<br>Hi Ana,<br>Welcome to the area, and yes, we have room for you. [{ServiceA} costs {priceA}. ]Is anything urgent, or is this a routine visit? And which mornings suit you best?<br>{signOff} | intent "Price and a first visit", status answered, qualifying ["Is anything urgent, or is this a routine visit?", "Which mornings suit you best?"], notes ["New customer", "Mornings only"] |
| C1-3 | 21:44:10 | Ana | Routine, nothing urgent. Wednesday or Thursday morning would be perfect. | |
| C1-4 | 21:44:31 | AI | Wednesday morning is full, but Thursday has two times free: 09:00 or 10:30. Which one should I book for you?<br>{signOff} | intent "Booking", status booking_offered, offeredSlots ["2026-11-12T09:00", "2026-11-12T10:30"], notes ["Routine visit", "Wed or Thu morning"] |
| C1-5 | 21:45:05 | Ana | 09:00 please! | |
| C1-6 | 21:45:16 | AI | Your {serviceA} is booked for Thursday 12 November at 09:00[ at {location}]. It's in our calendar, so there's nothing else you need to do. See you on Thursday!<br>{signOff} | intent "Booking", status booked, bookedSlot "2026-11-12T09:00" |
| C2-1 | 22:14:00 | Priya | hi! do you do {serviceB}? how much is it | |
| C2-2 | 22:14:38 | AI | Hi Priya! Yes, we do.[ {ServiceB} is {priceB}.] Is it for a date you have in mind, or whenever suits you? | intent "Asks about {serviceB}", status answered, qualifying ["Is it for a date you have in mind?"] |
| C2-3 | 22:16:40 | Priya | it's for my sister's wedding in march, so no rush. I'll check dates with her and come back to you | |
| C2-4 | 22:16:52 | AI | Congratulations to your sister! Message me here when you have dates and I'll find you a time well before March. | intent "Asks about {serviceB}", status answered, notes ["Wants a date before March"] |
| C3-1 | 23:31:00 | Tom | Hello, I run the office at Fernhill Architects. We're a team of 14 and we'd like to offer {serviceA} as a staff benefit next year. Do you work with companies? Happy to set up a call. | |
| C3-2 | 23:31:36 | AI | Hi Tom, thanks for getting in touch. Yes, {owner} sets up company arrangements personally. Two quick questions so the call is useful: about how many of the 14 would take part, and would you like one visit day or appointments spread over the year?<br>{assistant} | intent "Company offer for 14 people", status answered, qualifying ["How many of the 14 would take part?", "One visit day or appointments spread over the year?"] |
| C3-3 | 23:33:02 | Tom | Probably 10 to 12. Spread over the year works better for us. | |
| C3-4 | 23:33:20 | AI | Thanks, that helps. {owner} has a {minutes}-minute call free on Thursday or Friday at 10:30. Which day suits you better? | intent "Call with the owner", status booking_offered, offeredSlots ["2026-11-12T10:30", "2026-11-13T10:30"], notes ["10 to 12 people", "Spread over the year"] |
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

| Order | Channel | Name | Summary | Status |
| --- | --- | --- | --- | --- |
| 1 | Website chat | Daniel Moore | Refund request after a visit on Monday. Call back on 07700 900123 | Needs a human |
| 2 | LinkedIn | Tom Becker | Call booked, Fri 13 Nov 10:30. 10 to 12 people, spread over the year | Booked |
| 3 | Instagram | Priya Shah | Wants {serviceB} before March | Answered |
| 4 | Email | Ana Ruiz | Booked, Thu 12 Nov 09:00 | Booked |

Sort rule (`domain/inbox-snapshot.ts`): Needs a human first, then by last activity, newest first.
The summary is `handoverReason`, else "Booked, {slot}" plus the film notes, else the film notes, else `intent`.
Live mode has no notes, so its summary is `handoverReason`, the booked slot, or `intent`.

## 4. Live mode (`/live`)

The visitor plays the customer.
The page has three parts: the customer side, the owner view and the calendar.

### Channels

- A tab strip switches between Email, Instagram, LinkedIn and Website chat. Each tab keeps its own conversation, so a visitor can run four threads at once.
- Each tab renders the matching mockup from `@diepen/ui/mockups/*` with a composer. Email has a subject field (prefilled "Question") on the first message and a body field. The others have one text field and a Send button.
- Every channel opens in the visitor's own app, because the visitor is the customer. The visitor shows as "You" and the visitor's messages sit on the right. Email shows the visitor's mailbox `you@example.com`; Instagram shows the business (name, `{handle}`, logo) in the header; LinkedIn shows the assistant with the company name as the headline. LinkedIn puts every message on the left under its author's name, as LinkedIn does.
- Under an empty thread, three starter chips: "How much is {aServiceA}?" ("What are your prices?" when the profile lists no services), "Can I book a time this week?", "I'm not happy with how it went and I'd like a refund." A click sends the text.
- The active channel tab scrolls into view, so "Website chat", the tab live mode opens on, shows on a phone.
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
- Slot chips offered before the handover turn grey and can no longer be picked.
- No further request goes to `/api/reply` for a conversation with status `needs_human`.

### Owner view

- One row per channel with at least one message: channel icon, "You on Instagram" (and so on), summary, status chip, time of the last message.
- Same sort rule and same component as the film's owner lane.
- Header: "{company}", logo, and "Average first reply: 1.6 s" from the measured `replyMs` of each conversation's first reply.

### Notes on screen

- Keyless mock: when `/api/health` reports `provider: "mock"`, a note above the customer side reads "Demo answers. No API key is set.". Decision D4.
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

What changes:

| Part | Film | Live |
| --- | --- | --- |
| Company name, assistant name, owner name | Every slot in captions, messages, lane labels, owner view header, end card | Owner view header, business side of every channel, prompts, mock replies |
| Logo | Owner view header, chat widget header, Instagram and LinkedIn business avatars | Same places |
| Colours | `brand` and `brandForeground` as CSS variables: booked calendar blocks, AI lane accent, chat widget header, slot chips, buttons | Same |
| Services and prices | `{serviceA}`, `{serviceB}`, prices, through the slots | The model answers from `knowledge`; the mock uses `services[0]` |
| Voice (tone, words, sign-off) | `{signOff}` only. The rest of the film text is fixed | Full: the system prompt carries tone, words to use and avoid |
| Policies | `{handoverMessage}` only. The policy line stays "Policy: refunds go to {owner}" | Full: `handoverWhen` decides handovers |
| Location, booking length | `{location}`, `{minutes}` and the calendar block length | Slot length in the calendar |
| Fictional note | Switches to the "own profile" wording when `fictional` is false | The shell note disappears when `fictional` is false |

What stays: customer names, story times, statuses, the busy pattern and both end card numbers.

Rules:

- Film message texts that name the clinic, its people, its services or its prices are templates (section 3, "Slots"). A unit check proves no fixture holds the default preset's name.
- A URL logo renders as an image 32 px high with the company name as alt text. If it fails to load, a monogram of the company initials takes its place.
- In the film, applying a profile keeps the current film time and re-renders.
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
| `domain/metrics.ts` | `averageFirstReplySeconds`, `averageWaitUntilOpening(conversations, "08:00")`, `countByStatus`, `formatDuration` ("38 seconds", "9 hours") |
| `domain/message-template.ts` | `fillTemplate(text, profile)`: the slots, the optional parts in brackets, the a or an rule, the case rules |
| `domain/inbox-snapshot.ts` | `InboxSnapshot`, the view both modes render: conversations, AI cards, calendar blocks, owner rows; `sortOwnerRows` and the live `ownerSummary` |
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
| `infrastructure/fixture-page-fetcher.ts` | The made-up page "Make it yours" reads under the mock provider |
| `infrastructure/typing-pace.ts` | Slows the mock provider to a typing pace in keyless live mode |
| `infrastructure/container.ts` | Picks the provider with `createProvider` from `@diepen/ai` (mock when `AI_PROVIDER=mock` or no key), builds the cost guards from env, picks the page fetcher for "Make it yours" (a fixture page under the mock provider), and exposes `answerInquiry`, `guards`, `fetchPage` and `providerName`. Tests build a container with their own provider and guard limits |

### film/

| File | Holds |
| --- | --- |
| `film/fixtures.ts` | Customers, messages with their structured replies, the emails read before closing, story constants (section 3) |
| `film/film-beats.ts` | The beat table of section 2, with slots |
| `film/film-effects.ts` | `FilmEffect`, what one beat changes, and `InboxBeat` |
| `film/inbox-film.ts` | `buildInboxFilm(profile)`: the filled `FilmScript<InboxBeat>` through `defineFilmScript`, with lanes, clock keyframes from the beat rows, beats, captions, travel and the end card (section 2) |
| `film/apply-effect.ts` | Applies one effect to a snapshot |
| `film/film-state.ts` | `snapshotAt(ms, profile)`: folds every beat up to `ms` into an `InboxSnapshot`, so `?t=` and seeking land on the same picture as playing |

### ui/

| File | Holds |
| --- | --- |
| `ui/inbox-film.tsx` | `FilmStage` with the lane layout and the active brand |
| `ui/film-lanes.tsx` | The body of each of the four lanes, from an `InboxSnapshot` |
| `ui/lane-window.tsx` | Fills a lane with one app window and tells the engine where items land |
| `ui/film-cursor.tsx` | The pointer that clicks Daniel's row at 08:00 |
| `ui/channel-thread.tsx` | Renders the mockup for a channel with its messages, slot chips, handover note and composer, seen by the business (film) or by the customer (live) |
| `ui/channel-tab-strip.tsx` | The channel tabs with the active tab scrolled into view |
| `ui/use-whole-messages.ts` | Film only: scrolls a thread to the first message that fits whole, with the newest fully in view |
| `ui/use-phone-fit.ts` | Live mode below 768 px: the customer part ends right above the bottom tab bar, so the page never scrolls the composer under it |
| `ui/ai-card.tsx` | The AI lane card |
| `ui/owner-view.tsx` | Owner view list, filter chips and row detail, used in both modes |
| `ui/calendar-view.tsx` | The three-day calendar with busy, offered and booked blocks; one day at a time with a day switcher below 768 px in live mode. Blocks are exactly as long as their time |
| `ui/use-hour-grid.ts` | The calendar's hour height: the whole working day when it fits, else 64 px hours and a scroll to the blocks in focus, starting on a whole hour |
| `ui/owner-row.tsx` | One owner row and its detail: the thread and the call-back button |
| `ui/channel-mark.tsx` | The small coloured channel square |
| `ui/status-chip.tsx` | Status chip with label and semantic colour |
| `ui/starter-prompts.ts` | The three starter texts; the shared `StarterChips` draws them |
| `ui/live-inbox.tsx` | The live page body: layout, tabs, mobile tab bar |
| `ui/live-part-tabs.tsx` | The bottom tab bar below 768 px |
| `ui/live-snapshot.ts` | Owner rows, calendar blocks and thread views from the live state |
| `ui/use-visitor-now.ts` | The visitor's clock, read in the browser only |
| `ui/live-inbox-state.ts` | The client reducer: send, reply, book, hand over, start over, reset on profile change |
| `ui/reply-client.ts` | Posts to `/api/reply`, parses the response with zod, maps 429 to the film fallback. The reply time shown is the round trip the visitor waited |

### app/

| Route | Does |
| --- | --- |
| `app/layout.tsx` | Shell, brand provider, fonts. `/favicon.ico` is rewritten to the app icon in `next.config.ts` |
| `app/page.tsx` (`/`) | The demo shell in Film mode with `FilmStage`, `buildInboxFilm` and `renderLane`. Reads `?t=` (film ms), `?brand=`, `?note=` |
| `app/live/page.tsx` (`/live`) | The demo shell in Live mode with `live-inbox` |
| `app/api/reply/route.ts` | POST. Validates, runs guards, calls `answerInquiry` through the container |
| `app/api/reply/reply-request.ts` | The zod schema for the request, read with `readBodyText` from `@diepen/ai/request-body` so the 32 KB cap holds while the body streams in |
| `app/api/brand/route.ts` | POST. `createBrandHandler` from `@diepen/voice/brand-route` with the container's page fetcher, so the mock run never fetches a real page |
| `app/api/health/route.ts` | GET. Returns the app name and the provider name |

`POST /api/reply` request, validated with zod, body at most 32 KB:

```ts
{
  channel: "email" | "instagram" | "linkedin" | "chat";
  profile: CompanyProfile; // companyProfileSchema
  messages: { role: "customer" | "assistant"; text: string }[]; // 1 to 20, text 1 to 1000 chars, last role "customer"
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
| 503 | `{ fallback: "film", reason: "unavailable" }` | The provider threw (`unavailableResponse` from `@diepen/ai/route-responses`, the one shape every app uses). The thread shows "No answer this time. Send it again." |

`POST /api/brand`: the shape `handleBrandRequest` defines; 429 is `{ fallback: "film" }` as everywhere.

`GET /api/health`: `{ ok: true, app: "inbox", provider: "claude" | "mock" }`.

## 7. Layout

| Viewport | Film (`/`) | Live (`/live`) |
| --- | --- | --- |
| 1920x1080, for recording | Header 56 px. The stage keeps 16:9 and scales to fill the space between header and controls, centred. Four lanes in one row. Caption bar at the stage bottom, text about 28 px (the shared `CaptionBar`, 1.45vw). Clock top right of the stage, tabular figures. Smallest text in a lane 18 px | Content max 1600 px wide. Customer side left (55 %), owner view top right (two fifths of the height), calendar bottom right (three fifths) |
| 1440x900 | Same as 1920, scaled. Caption text at least 24 px, smallest lane text at least 14 px. Controls stay visible below the stage without scrolling | Same as 1920 at full width with 32 px gutters |
| 375 px wide | The engine's narrow mode (below 768 px): a strip of the four lane names with the clock, the body shows the lane of the current beat, travel shows as a pulse on the target lane name. The stage takes the height under the shell header, so caption and controls show without scrolling. The customers lane drops its channel tabs; the channel's title bar names it. Caption under the lane, 16 px, at most two lines. End card stacks: metric, before, after, then the lines | A bottom tab bar: "Customer", "Owner view", "Calendar", with a dot when the hidden part changes. The customer part ends right above the bar. The calendar day buttons are 44 px. The channel tab strip scrolls sideways inside itself. Calendar shows one day with a day switcher |

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
Prefer roles and visible text as selectors. Test ids where text is not stable: `data-lane="customers"` (and the other lane ids), `data-testid="owner-row"` with `data-channel`, `status-chip`, `calendar-booking`, `end-card`, `provider-note`, `slot-chip`.

### Unit checks (Vitest)

| Check | Feature | Assertion |
| --- | --- | --- |
| U1 | `inbox.live-booking` | `freeSlots` with `now` Tue 10 Nov 21:42 and 30-minute slots returns only Wed to Fri slots between 08:00 and 18:00, none overlapping a busy block, first slot Wed 11 Nov 12:30 |
| U2 | `inbox.live-booking` | `freeSlots` with `now` Friday 18:30 starts on Monday; a booked slot is no longer free |
| U3 | `inbox.live-booking` | `checkReply` keeps a valid offer and booking; it turns a booked slot that is not free, or was not offered, into `booking_offered` with two slots from `spreadSlots`; it cuts offers to at most three. `spreadSlots` never offers two slots back to back |
| U4 | `inbox.live-handover` | `applyReply` moves answered to booking_offered to booked; after `needs_human` every later reply keeps `needs_human`, and `acceptsReplies` is false |
| U5 | `inbox.film` | `metrics` on the fixtures: average first reply 38 seconds, average wait until 08:00 is 540 minutes, `formatDuration(38)` is "38 seconds", `formatDuration(32400)` is "9 hours", counts booked 2, answered 1, needs_human 1 |
| U6 | `inbox.film` | The script: beats sorted by ms, story times never go down, last beat at most 90000 ms and at least 60000 ms, every lane and travel end is one of the four lane ids, all four channels appear, at least one beat sets `needs_human`, the end card has metric, before and after |
| U7 | `inbox.film` | Every caption, after filling with each of the three presets, is at most 60 characters and contains no em dash (U+2014) and no en dash (U+2013) |
| U8 | `inbox.film` | `snapshotAt(66000)` has four conversations in the owner order of section 3 with the statuses there; `snapshotAt(20500)` shows Ana's booking in the calendar and Tom's conversation does not exist yet |
| U9 | `inbox.make-it-yours` | `fillTemplate` replaces every slot, drops an optional part with an empty slot, writes "an" before a vowel, lowercases the first letter unless the second is uppercase; with each preset, no fixture text keeps a `{` or `[` |
| U10 | `inbox.make-it-yours` | No fixture text contains the default preset's company name, owner name or any of its prices as literal text |
| U11 | `inbox.live-chat` | `answerInquiry` with the mock provider: "How much is it?" gives `answered` with the first service's price in the reply; "Can I book?" gives `booking_offered` with two free slots; a message with the `HH:MM` of an offered slot gives `booked` with that slot; "I want a refund" gives `needs_human`, a `handoverReason`, and the profile's handover message |
| U12 | `inbox.live-chat` | `answerInquiry` calls the provider once with role `chat`, a system prompt that contains the company name, and at most 20 messages; a stub provider that returns an invalid booked slot ends as `booking_offered` |
| U13 | `inbox.live-chat` | `POST /api/reply` returns 400 for a missing profile, an unknown channel, no messages, a last message from the assistant, a message over 1000 characters, more than 20 messages, and a body over 32 KB, and stops reading a streamed body with no declared length at 32 KB |
| U14 | `inbox.limit-fallback` | `POST /api/reply` with a container whose daily cap is 0 returns 429 and `{ fallback: "film" }`, and the provider is never called |
| U15 | `inbox.live-chat` | `GET /api/health` returns `provider: "mock"` under `AI_PROVIDER=mock` |
| U16 | `inbox.film` | Fixtures: every customer email ends in `@example.com`, every phone number starts with `07700 900` |
| U17 | `inbox.live-chat` | Mock replies: a complaint without the word "complaint" hands over; "Do you treat dogs?" hands over by the profile's knowledge rule; a FAQ question gets its answer; a booking offer spans two days; an email greets and signs off; a profile with no services, prices or hours and an owner called "the team" gets sentences that read well. Starters ask "What are your prices?" without services |

### Flow checks (Playwright, mock provider, desktop and phone projects)

| Check | Feature | Steps and assertion |
| --- | --- | --- |
| F1 | `inbox.film` | Open `/?t=80000`. Within 15 s the end card shows "Reply time", "9 hours", "38 seconds" and the fictional note |
| F2 | `inbox.film` | Open `/?t=20000`, set the speed to 2x and play until the end card shows; on the way the Instagram, LinkedIn and Website chat tabs each become active |
| F3 | `inbox.film-controls` | On `/`: Pause stops the clock (same clock text after 1 s); Play resumes it; Restart sets the clock to 21:40; the speed control cycles 0.5x, 1x, 1.5x, 2x |
| F4 | `inbox.film-controls` | Open `/?t=53000`. The Website chat tab is active and the clock reads 00:33 |
| F5 | `inbox.owner-view` | Open `/?t=66000`. The owner view has four rows in this order: Daniel Moore with "Needs a human", Tom Becker with "Booked", Priya Shah with "Answered", Ana Ruiz with "Booked" |
| F6 | `inbox.live-chat` | On `/live`, on each of the four channel tabs, send "What are your opening hours?". An assistant message appears in that tab's thread and the owner view has a row for that channel with "Answered" |
| F7 | `inbox.live-chat` | On `/live` the provider note reads "Demo answers. No API key is set." |
| F8 | `inbox.live-booking` | On `/live`, Website chat: send "Can I book an appointment?". Two slot chips appear, Wed 11 Nov 12:30 and Thu 12 Nov 09:00. Click the first. The reply says the booking, a calendar block with that time appears, and the owner row shows "Booked" |
| F9 | `inbox.live-handover` | On `/live`, Instagram: send "I'm not happy with how it went and I'd like a refund." The reply contains the preset's handover message, the owner row shows "Needs a human" at the top, the composer is replaced by "Start over", and no further request to `/api/reply` is made. "Start over" clears the thread |
| F10 | `inbox.limit-fallback` | On `/live`, route `/api/reply` to answer 429 `{ fallback: "film" }`. After sending a message the page is `/` with the note "Live answers are paused for now. Here is the film." and the film stage visible |
| F11 | `inbox.make-it-yours` | On `/`, open "Make it yours" and pick the property manager preset. The owner view header and the lane label show that preset's company and assistant names, and the brand CSS variable changes. On `/live` after the same step, a reply mentions the new company name |
| F12 | `inbox.make-it-yours` | Open `/?t=80000&brand=<encoded test profile>` (a fictional plumbing company in `e2e/fixtures/test-profile.ts`, `fictional: false`). The end card note uses the "own profile" wording with that name. `/live?brand=<same>` shows the name in the owner view header and in a mock reply |
| F13 | `inbox.make-it-yours` | In the panel, enter `https://example.com`, apply. The mock profile from `/api/brand` is applied (its name shows in the owner view header); under the mock provider the container's fixture page fetcher answers, so no request leaves the server |
| F14 | `inbox.film`, `inbox.live-chat` | At 375 px wide, on `/`, `/?t=30000`, `/?t=80000`, and `/live` on each bottom tab and each channel tab, `document.documentElement.scrollWidth` is at most 375 |
| F15 | `inbox.film`, `inbox.live-chat` | No console errors and no failed requests on `/`, `/?t=80000` and `/live` after one sent message |
| F16 | `inbox.film` | At 1920x1080, `/?t=7000` shows the four lanes side by side and the caption text is about 28 px (at least 27.5 px: the shared caption bar is 1.45vw) |
| F17 | `inbox.live-handover` | On `/live`, Website chat: ask to book, then complain without the word "complaint". The thread hands over and the earlier slot chips are no longer buttons |
| F18 | `inbox.live-chat` | On `/live`, with `/api/reply` failing, click a starter. The message stays in the thread marked "Not answered"; sending it again shows it once |

## 9. Feature rows

| Id | A user can | Reach it | As | Status |
| --- | --- | --- | --- | --- |
| `inbox.film` | Watch an 86-second film of four after-hours messages answered, booked and handed over, ending on reply time: 9 hours before, 38 seconds now | `/` | anon | shipped |
| `inbox.film-controls` | Pause, restart and change the speed of the film, or start it at a moment with `?t=` in ms | `/`, controls under the stage | anon | shipped |
| `inbox.owner-view` | See every conversation with its status, needs a human first | `/`, owner lane; `/live`, "Owner view" | anon | shipped |
| `inbox.live-chat` | Write as a customer on email, Instagram, LinkedIn or website chat and get an answer in the company's voice | `/live`, channel tabs | anon | shipped |
| `inbox.live-booking` | Book a slot the AI offers and see it in the calendar | `/live`, "Can I book a time this week?", then a slot chip | anon | shipped |
| `inbox.live-handover` | Ask for a refund, complain, or ask what the company knowledge cannot answer, and see the conversation handed to the owner as "Needs a human" | `/live`, "I'm not happy with how it went and I'd like a refund." | anon | shipped |
| `inbox.limit-fallback` | See the film with a short note when live answers hit a limit | `/live`, then `/?fallback=limit` | anon | shipped |
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
| Recording without shell controls | A `?record=1` parameter hides the header and controls. The shell does not offer it yet; until it does, crop the controls out of the recording |
| The `inbox-reply` context needs a customer name, and a live visitor has none | Pass "there", so an email greets "Hi there" |
| Service names that read badly mid-sentence (plurals, proper nouns) | Accept it; preset service names are written in sentence case so they read inside a sentence |
