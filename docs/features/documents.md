# documents

Demo 2, Document chaser, in `apps/documents` on port 3102.
A fictional accounting firm asks a client for the documents of his 2025 tax return, and the system collects, checks, files and chases them.
This file is the plan for the slice: a test writer and a builder need nothing else.

## 1. What it proves

You send one request, and every document your client uploads is read, checked, named and filed in Drive within seconds.
When something is wrong or missing, the client gets an email that names the exact document and the reason, and a second reminder goes out three days later by itself.
You open one checklist per client and see what is checked, what has a problem and what is still missing.

## 2. Film script

The film runs 72,000 ms: 61 seconds of story and an 11 second end card.
It always tells Ledgerwick's story with the documents preset, `ledgerwick-accounting` (Ledgerwick Tax & Accounting, owner Sabine Roth, assistant "Clara from Ledgerwick"), as decision F1 says.
`{firm}` and `{owner}` in captions and emails stand for that preset's names; "Make it yours" changes live mode only.
The client is always Daniel Okafor, a fictional person, and the tax year is always 2025.
Film mode reads only recorded fixtures: no key, no network, no call to `/api/check` or `/api/chase`.

### Lanes

| Order | Lane id | Label | Role | Tab | Why it is its own lane |
| --- | --- | --- | --- | --- | --- |
| 1 | `firm` | `{firm}` | profile `industry` | Firm | The buyer. Their checklist and summary are what they would pay for. `brand: true` |
| 2 | `client` | Daniel Okafor | Client | Client | The client's phone: inbox, upload page, signing. It shows how little the client has to do |
| 3 | `system` | Document chaser | Automation | System | The checks and the reminder schedule. This is the work the firm does by hand today |
| 4 | `drive` | Drive | Client folder | Drive | Where files land, named and sorted. Firms judge a system by whether their folder stays clean |

The order keeps the busiest paths short: Firm to Client (request), Client to System (uploads), System to Drive (filing).
The client lane renders as a phone frame on desktop.
The Tab column is the lane's `tabLabel`, which the phone layout's tabs show.

### Clock keyframes

Story times have no zone offset and render as written, for example "Mon 9 Mar, 09:00".

| At (ms) | Story time | Curve | What happens to time |
| --- | --- | --- | --- |
| 0 | `2026-03-09T09:00` | | The firm sends the request on Monday morning |
| 4500 | `2026-03-09T09:00` | linear | Holds while the email travels |
| 7000 | `2026-03-09T12:40` | ease | Daniel opens it at lunch |
| 16000 | `2026-03-09T12:44` | linear | Signing |
| 37000 | `2026-03-09T12:50` | linear | Uploads and checks |
| 41000 | `2026-03-09T12:50` | linear | Holds on the follow-up |
| 45000 | `2026-03-12T12:50` | ease | Three days pass in four seconds |
| 47500 | `2026-03-12T12:50` | linear | Holds on the reminder |
| 49000 | `2026-03-12T19:20` | ease | Thursday evening |
| 60000 | `2026-03-12T19:24` | linear | Last checks and the complete checklist |

### Beats

One travel per beat; the beat's lane is where the item lands. Travel time is the default 800 ms, except where the table says otherwise.
The Clock column is the minute the clock shows when the beat starts.
Beat data is a typed `DocumentsBeat` (see Architecture, `film/`); each lane folds its beats with the domain functions, so a seek with `?t=` shows the same frame as playing to that point.

| # | At (ms) | Lane | What appears | Travel (from, kind, label) | Clock | Caption |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | firm | Checklist "Daniel Okafor, Tax return 2025": 6 rows, all Missing. A card "6 documents for Daniel's tax return" with the button "Send request", until beat 2 starts; then the checklist reads "Requested Mon 09:00, due 31 Mar" | | Mon 9 Mar, 09:00 | {firm} needs 6 documents for Daniel's 2025 tax return. |
| 2 | 3000 | client | Inbox with the unread request email "Your 2025 tax return: 6 documents" | from firm, message, "Your 2025 tax return: 6 documents" | 09:00 | One click sends the request. |
| 3 | 5000 | client | The email opens: the 6 items as a numbered list, button "Upload and sign". After 900 ms the phone scrolls down to the button | | 09:00 | Daniel gets one email with one link. |
| 4 | 8000 | client | Upload page: firm logo, address bar `ledgerwick.example` (a phone browser shows the site only), 6 item rows | | 12:40 | The link opens a page with his 6 items. |
| 5 | 10500 | client | Engagement letter, the phone scrolls to the signature line, the signature draws in 1,200 ms, stamp "Signed 12:41" (the minute the beat starts) | | 12:41 | He signs the engagement letter right on the page. |
| 6 | 13000 | drive | `01 Engagement` gets `2025_Okafor-Daniel_Engagement-letter_signed.pdf` | from client, document, file name | 12:42 | The signed copy lands in Drive, named and filed. |
| 7 | 14200 | firm | Row "Signed engagement letter" turns Checked | from client, event, "Signed" | 12:42 | |
| 8 | 16000 | client | 4 files fill their slots, each shows "Uploading" | | 12:44 | He adds 4 files from his phone. |
| 9 | 16600 | system | Check card "payslip-summary-2025.pdf", "Reading" for 1,000 ms after landing | from client, document, "payslip-summary-2025.pdf" | 12:44 | |
| 10 | 16900 | system | Queued card "bank-interest-statement-2024.pdf" | from client, document, file name | 12:44 | |
| 11 | 17200 | system | Queued card "donation-receipt-2025.pdf" | from client, document, file name | 12:44 | |
| 12 | 17500 | system | Queued card "home-office-confirmation-2025-unsigned.pdf" | from client, document, file name | 12:44 | |
| 13 | 17800 | firm | Rows 2, 3, 4 and 5 turn Received | from system, event, "4 received" | 12:44 | |
| 14 | 20000 | system | Payslip result: Annual payslip summary, Daniel Okafor, 2025, 2 of 2 pages, Gross pay EUR 58,400.00, Income tax withheld EUR 9,870.00. Badge Checked | | 12:45 | Each file is read: type, name, year, pages, signature. |
| 15 | 21500 | drive | `02 Income` gets `2025_Okafor-Daniel_Payslip-summary.pdf` | from system, document, file name | 12:45 | |
| 16 | 22300 | firm | Row "Annual payslip summary 2025" turns Checked | from system, event, "Checked" | 12:45 | |
| 17 | 24000 | system | Bank result: Problem found. "Covers 1 Jan to 31 Dec 2024. The 2025 statement is needed." | | 12:46 | Wrong year caught. This is his 2024 bank statement. |
| 18 | 25500 | drive | `00 Needs attention` gets `2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf` | from system, document, file name | 12:46 | |
| 19 | 26300 | firm | Row "Bank interest statement 2025" turns Problem found, note "2024 version sent" | from system, event, "Problem found", 700 ms, so it lands at 27,000 ms | 12:46 | |
| 20 | 27500 | system | Donation result: Donation EUR 250.00, Elm Street Food Bank, 14 Dec 2025. Badge Checked | | 12:47 | Key numbers come out of every document. |
| 21 | 28800 | drive | `04 Deductions` gets `2025_Okafor-Daniel_Donation-receipt.pdf` | from system, document, file name | 12:47 | |
| 22 | 29600 | firm | Row "Donation receipt 2025" turns Checked | from system, event, "Checked" | 12:47 | |
| 23 | 31000 | system | Home office result: Problem found. "The employer signature field on page 1 is empty." | | 12:48 | The home office form is missing his employer's signature. |
| 24 | 32300 | drive | `00 Needs attention` gets `2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf` | from system, document, file name | 12:48 | |
| 25 | 33100 | firm | Row "Home office confirmation 2025" turns Problem found, note "Employer signature missing" | from system, event, "Problem found" | 12:48 | |
| 26 | 34500 | firm | Summary card: "3 of 6 checked. 2 problems, 1 missing." with the two problem lines and the key figures | | 12:49 | {owner} reads one summary instead of opening 4 files. |
| 27 | 37500 | client | Follow-up email opens: "3 documents still needed for your 2025 tax return", numbered list of the 3 with reasons | from system, message, "3 documents still needed" | 12:50 | The follow-up names exactly what is missing and why. |
| 28 | 41000 | system | Schedule card "Reminder 2: Thu 12 Mar, 12:50" with a 3 day progress bar that fills as the clock races | | 12:50 | Three days pass. Nothing comes back. |
| 29 | 45500 | client | Reminder email "Reminder: 3 documents still open" | from system, message, "Reminder: 3 documents still open" | Thu 12 Mar, 12:50 | Day 3: the second reminder goes out on its own. |
| 30 | 49000 | client | Upload page again, 3 files fill their slots | | 19:20 | Daniel sends the last 3 that evening. |
| 31 | 49600 | system | Card "bank-interest-statement-2025.pdf" | from client, document, file name | 19:20 | |
| 32 | 49900 | system | Card "home-office-confirmation-2025-signed.pdf" | from client, document, file name | 19:20 | |
| 33 | 50200 | system | Card "health-insurance-statement-2025.png" | from client, document, file name | 19:20 | |
| 34 | 51000 | firm | Rows 3, 5 and 6 turn Received | from system, event, "3 received" | 19:20 | |
| 35 | 52500 | system | 3 compact result cards, all Checked, with one key figure each | | 19:21 | |
| 36 | 53500 | drive | `03 Bank` gets `2025_Okafor-Daniel_Bank-interest-statement.pdf`; the 2024 file moves to `99 Replaced`, and the Drive lane scrolls to the end of the tree, where `99 Replaced` and the moved files show whole. The 2024 check card shrinks to its file name with the badge "Replaced" | from system, document, file name | 19:21 | All 3 pass. The old files move to Replaced. |
| 37 | 54000 | drive | `04 Deductions` gets `2025_Okafor-Daniel_Home-office-confirmation.pdf`; the unsigned file moves to `99 Replaced` and its check card shows "Replaced" | from system, document, file name | 19:21 | |
| 38 | 54500 | drive | `05 Insurance` gets `2025_Okafor-Daniel_Health-insurance-statement.png` | from system, document, file name | 19:21 | |
| 39 | 55500 | firm | Rows 3, 5 and 6 turn Checked | from system, event, "3 checked" | 19:22 | |
| 40 | 57500 | firm | Header "6 of 6 checked", status "Complete. Ready to prepare the return." | | 19:23 | Every document is in, checked and filed. |

Every caption stays at or under 80 characters.

While the upload page shows, the phone keeps the row that changed last in view, and after "Every document is in" it returns to the top, where "6 of 6 done" shows.
The Drive lane keeps the newest file in view; once `99 Replaced` holds files, it shows the end of the tree.

### End card

Starts at 61,000 ms and holds until 72,000 ms.

| Field | Text |
| --- | --- |
| metric | Hours a month spent chasing documents |
| before | 12 hours |
| after | 1 hour |
| lines | Each upload is checked as it arrives. |
| | Follow-ups name the exact document and the reason. |
| note | Simulation with a fictional firm and client. Before: an example calculation for 40 tax returns a month, 3 chases each, 6 minutes per chase. After: 1.5 minutes per return to read the summary. |

The note states where both numbers come from and makes no claim about a real firm.
The end card's "Try it live" goes to `/live` with the active brand kept.

## 3. Fixtures

Every sample document is fake.
Each page carries a large diagonal "SAMPLE" watermark and the footer "Sample document for the diepen.ai demo. Fictional person and numbers." plus "Page X of Y".

### People and places

| Field | Value |
| --- | --- |
| Client | Daniel Okafor, 14 Sample Street, 00000 Exampletown |
| Spouse (wrong person sample) | Amara Okafor, same address |
| Tax id format | `SAMPLE-ID 00 000 000 001` (Amara: `...002`) |
| Employer | Bramble Freight Ltd (fictional), HR contact Priya Shah |
| Bank | Sample Savings Bank (fictional) |
| Charity | Elm Street Food Bank (fictional) |
| Insurer | Lindgren Health (fictional) |
| Currency | EUR, printed as "EUR 58,400.00" |

### Checklist items

| Order | Item id | Label | Kind | Detail shown to the client | Drive folder | File label |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `engagement-letter` | Signed engagement letter | signature | Sign on this page | `01 Engagement` | Engagement-letter |
| 2 | `payslip-summary` | Annual payslip summary 2025 | upload | From your employer, all pages | `02 Income` | Payslip-summary |
| 3 | `bank-interest` | Bank interest statement 2025 | upload | From each bank, for 2025 | `03 Bank` | Bank-interest-statement |
| 4 | `donation-receipt` | Donation receipt 2025 | upload | One receipt per donation | `04 Deductions` | Donation-receipt |
| 5 | `home-office` | Home office confirmation 2025 | upload | Signed by your employer | `04 Deductions` | Home-office-confirmation |
| 6 | `health-insurance` | Health insurance statement 2025 | upload | From your insurer, a photo works | `05 Insurance` | Health-insurance-statement |

Among the upload items only `home-office` has `needsSignature`.
The engagement letter is no fixture: `ui/engagement-letter.tsx` renders it from the profile (firm name, owner, the "Income tax return for employees" service and its price), and signing happens on the page.

### Sample files

All live in `apps/documents/public/fixtures/`. "Film" means the film uses it; every sample is offered in live mode under its item.

| # | File | Item | Person, year, pages | What is wrong | Recorded check result | Film |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `payslip-summary-2025.pdf` | payslip-summary | Daniel Okafor, 2025, 2 pages | Nothing | ok. documentType "Annual payslip summary", pageCount 2. Figures: Gross pay EUR 58,400.00; Income tax withheld EUR 9,870.00; Employer Bramble Freight Ltd. Summary "Annual payslip summary 2025 from Bramble Freight Ltd for Daniel Okafor. Gross pay EUR 58,400.00, income tax withheld EUR 9,870.00." | yes |
| 2 | `payslip-summary-2025-page-1-only.pdf` | payslip-summary | Daniel Okafor, 2025, 1 page printed "Page 1 of 2" | Page 2 with the tax withheld is missing | problem. missing_page "The summary says page 1 of 2. Page 2 with the tax withheld is missing." pageCount 1. Figures: Gross pay EUR 58,400.00 | no |
| 3 | `payslip-summary-2025-amara-okafor.pdf` | payslip-summary | Amara Okafor, 2025, 2 pages | Spouse's document | problem. wrong_person "This summary is for Amara Okafor. Daniel Okafor's is needed." person "Amara Okafor". Figures: Gross pay EUR 41,200.00 | no |
| 4 | `bank-interest-statement-2024.pdf` | bank-interest | Daniel Okafor, 2024, 1 page | Last year's statement | problem. wrong_year "Covers 1 Jan to 31 Dec 2024. The 2025 statement is needed." year 2024. Figures: Interest earned EUR 112.40 | yes |
| 5 | `bank-interest-statement-2025.pdf` | bank-interest | Daniel Okafor, 2025, 1 page | Nothing | ok. Figures: Interest earned EUR 138.75; Tax withheld EUR 0.00. Summary "2025 interest statement from Sample Savings Bank. Interest earned EUR 138.75, no tax withheld." | yes |
| 6 | `donation-receipt-2025.pdf` | donation-receipt | Daniel Okafor, 2025, 1 page, signed by the charity | Nothing | ok. signed true. Figures: Donation EUR 250.00; Date 14 Dec 2025; Recipient Elm Street Food Bank | yes |
| 7 | `home-office-confirmation-2025-unsigned.pdf` | home-office | Daniel Okafor, 2025, 1 page | Employer signature line, name and date fields empty | problem. missing_signature "The employer signature field on page 1 is empty." signed false. Figures: Home office days "96 days" | yes |
| 8 | `home-office-confirmation-2025-signed.pdf` | home-office | Daniel Okafor, 2025, 1 page | Nothing. Drawn signature, printed "Priya Shah, HR, 20 Jan 2026" | ok. signed true. Figures: Home office days "96 days" | yes |
| 9 | `health-insurance-statement-2025.png` | health-insurance | Daniel Okafor, 2025, 1 image | Nothing. Looks like a phone photo of a letter | ok. pageCount 1. Figures: Premiums paid EUR 2,964.00; Insurer Lindgren Health | yes |

Every recorded result has `matchesRequest: true`, and every `status` equals what `domain/check-rules.ts` computes from its issues.
Each recorded result is one entry in `domain/sample-documents.ts`; the film, the keyless mock answers and the fixture generator all read that one file.
The signed and unsigned forms carry both cues a text-only OCR can see (filled or empty name and date under the line), so the check works with Google Document AI text as well as with Claude reading the file.

### Generating them

- `apps/documents/scripts/generate-fixtures.ts` exports `buildFixtures(): Promise<Map<string, Uint8Array>>` and, run as a script, writes every entry to `public/fixtures/`.
  Run it with `pnpm --filter @diepen/documents fixtures`, which is `node scripts/generate-fixtures.ts` (Node 24 strips the types, as `scripts/verify` does).
- One template file per document kind in `apps/documents/scripts/fixtures/`: `sample-page.ts` (letterhead, watermark, footer, page numbers), `payslip-summary.ts`, `bank-interest-statement.ts`, `donation-receipt.ts`, `home-office-confirmation.ts`, `health-insurance-photo.ts`, `signature-paths.ts` (fixed SVG paths for the two signatures).
- PDFs use `pdf-lib` with the standard Helvetica fonts, `PDFDocument.create({ updateMetadata: false })`, fixed title, author, producer and creator, creation and modification date `2026-01-15T00:00:00Z`, and `save({ useObjectStreams: false })`.
  Signatures are drawn with `drawSvgPath`.
- The PNG is an SVG rendered with `@resvg/resvg-js`, `loadSystemFonts: false`, the Geist TTF files from the `geist` package as the only fonts, 1240 px wide (A4 at 150 dpi), off-white paper rotated 0.6 degrees on a grey background, no random noise.
- `pdf-lib` and `@resvg/resvg-js` are dev dependencies of `apps/documents`.
- The files are committed. Each one stays under 300 KB.
- `scripts/generate-fixtures.ts` imports `../domain/sample-documents.ts` by relative path, so that module has only type imports.

## 4. Live mode (`/live`)

The visitor plays Daniel Okafor.
The same four lanes as the film show; the client lane is interactive and the others update from real check results.
The story clock starts at Mon 9 Mar, 12:40 and moves in real time; "Skip 3 days" adds three days.
The page keeps the live session in browser memory only; a reload or "Start over" begins again.

### The flow

1. The client lane shows the inbox with the unread request email from `{assistantName}`. The firm lane shows the checklist with 6 Missing rows, "Requested Mon 09:00". Inbox rows show the weekday and the time, for example "Mon 09:00".
2. The visitor opens the email and clicks "Upload and sign". The client lane shows the upload page with the firm's logo, colour and address bar.
3. Each upload item has "Upload" (file picker, also accepts drag and drop on desktop) and "Use a sample" (a menu of the samples for that item, labelled by what they are, for example "2024 statement").
   "Use a sample" fetches `/fixtures/<file>` and uploads it as a `File` with the sample's name, so the request is the same as an upload of that file.
4. On upload the item turns Received and the system lane shows a card for the file with "Reading". The browser posts the file to `/api/check`.
5. The answer fills the card (type, person, year, pages, signature, key figures, summary, issues), turns the item Checked or Problem found on the upload page and in the firm checklist, and files the file in the Drive lane with the domain naming and sorting.
   A Problem found item on the upload page shows the client reason line and "Upload again". A Checked item has no upload button.
6. "Review and sign" opens the engagement letter with a signature pad ("Sign here") and one row of buttons: "Back", "Clear", "Type your name" (then "Draw instead") and "Sign"; on a narrow phone they form two even rows with "Sign" at the bottom right. A typed name shows on the signature line as it is typed. "Sign" stays disabled until there is a stroke or a typed name. Signing turns the item Checked and puts the signed copy in `01 Engagement`. Signing makes no server call.
7. "Done for now" posts the session to `/api/chase` with `event: "submitted"`. When items are outstanding, the follow-up email arrives in the inbox at once, its card in the system lane says "Sent when Daniel pressed Done for now", and the system lane shows "Reminder 2" with its date. When nothing is outstanding, the firm lane shows "Complete. Ready to prepare the return." and no email goes out.
8. "Skip 3 days" posts the session to `/api/chase` with `event: "skip-days"`. The clock jumps three days and whatever the schedule says is due goes out: the follow-up if "Done for now" was never pressed, else the second reminder, else the escalation, which appears in the firm lane as a task "Call Daniel Okafor: 3 documents still open after 2 reminders". A chase that went out this way says "Went out on its own"; the escalation's card says "Task" and "Added to {firm}'s tasks". A follow-up sent before Daniel uploaded any file opens with "{firm} is ready to start on your 2025 tax return and needs these documents from you:" instead of thanking him. After the escalation, or once the request is complete, "Skip 3 days" is disabled.
9. "Start over" clears the session and returns to step 1.

The live session keeps facts only: which email went out when, which items it listed, and whether any file had come in.
Emails, the letter and the lanes are written from the active profile on every render, so a profile from local storage, or one applied mid-session, shows in every email already in the inbox.
A check card whose item later passed shrinks to its file name with the badge "Replaced".

### Upload limits

| Rule | Value | Where it is enforced |
| --- | --- | --- |
| Types | PDF, PNG, JPEG, checked by the first bytes (`%PDF-`, PNG signature, `FF D8 FF`), not by the extension | Browser before upload, and `/api/check` |
| Size | 4,000,000 bytes per file | Browser before upload, and `/api/check` |
| Request | One file per request, whole multipart body at most 4,400,000 bytes (Vercel's limit is 4.5 MB) | `/api/check` reads `content-length` first |

Messages: "Use a PDF, PNG or JPEG." and "Files up to 4 MB." Neither sends a request.
Under the upload items: "PDF, PNG or JPEG, up to 4 MB. Your file goes to Claude for this one check. This demo keeps no copy."
The route reads the file into memory, passes it to the OCR port and the AI provider, and drops it. Nothing writes the bytes to disk, a log or a store, and the browser keeps only the file names.

### Keyless and cost guards

- With no `ANTHROPIC_API_KEY`, `/api/check` answers with the mock provider and the page shows the shell's `ProviderNote` ("Demo answers. No API key is set.").
- The mock answer is keyed on the uploaded file name: each of the 9 sample names returns its recorded result from `domain/sample-documents.ts`, then runs through `domain/check-rules.ts` like a real answer.
  Any other name returns `status: "problem"`, `documentType: "Unknown document"`, person and year `null`, one issue `{ kind: "other", detail: "Demo answers only cover the sample files. Pick a sample to see a full check." }`, and the item turns Problem found.
- `/api/check` runs `guards.check` after validation and caps output tokens with `guards.clampMaxTokens(1200)`. A trip answers with `fallbackResponse` (429 `{ fallback: "film" }`), and the live page swaps to the film with the shell's `FallbackNote`.
- `/api/chase` makes no AI call and runs no cost guard. It only validates and limits its body.

## 5. Make it yours

The visitor's profile (from the shell's "Make it yours", in `?brand=` and local storage) changes:

- The firm lane: name, logo, brand colour on the lane header, role line from `industry`.
- Every email: sender `{assistantName}`, the firm name in the subject line and body, the `signOff`, and the reply-to `contactEmail`.
- The upload page: logo, name, primary button colour (`brand` with `brandForeground` text), and the address bar host from `website` (`ledgerwick.example` by default; `upload.example` when the profile has none).
- The engagement letter: firm name, "Your contact" with the owner's name and role (the role is left out when it only repeats the name, as in a drafted profile's "The owner, Owner"), the service and price that best match "tax return" in `knowledge.services` (the first service when none matches).
- The Drive root: "My Drive / {firm} / Clients / Okafor, Daniel / 2025 Tax return".
- The check summaries: `buildSystemPrompt` gets the profile, so the summary for the firm follows its tone and words to use and avoid.
- The film does not change: it always tells Ledgerwick's story (decision F1).

What stays: Daniel Okafor, the tax year, the 6 items, the samples, the reminder interval and the end card numbers.

## 6. Architecture

All paths are under `apps/documents/`.

### domain/

| File | Holds |
| --- | --- |
| `domain/document-request.ts` | `DocumentRequest` and `RequestItem` types, the 6 items, the fictional client, tax year 2025, due date 31 Mar 2026, `createTaxReturnRequest(sentAt)` |
| `domain/checklist.ts` | The item state machine (`missing`, `received`, `checked`, `problem`), `transition(item, event)`, `outstanding(items)`, `progress(items)`, `isComplete(items)` |
| `domain/check-result.ts` | `CheckResult` zod schema and type, the same shape as the voice task's `DocumentCheck` (a type test keeps them identical) |
| `domain/check-rules.ts` | `applyCheckRules(result, item, request)`: adds the issues the model missed and sets `status` from the issues |
| `domain/client-reasons.ts` | `clientReason(item, state)`: the one line per outstanding item the client reads in emails and on the upload page |
| `domain/file-naming.ts` | `fileNameFor(item, result, extension)` |
| `domain/drive-folder.ts` | The Drive tree type, folder names and order, `fileIntoDrive(tree, entry)` with the move to `99 Replaced` |
| `domain/reminder-schedule.ts` | `chaseIntervalDays = 3`, `nextChase(session)` returns the next follow-up, reminder or escalation and its due time, or `null` |
| `domain/chase-emails.ts` | `requestEmail`, `followUpEmail`, `reminderEmail` and `escalationTask` from the profile and the outstanding items, and `anyFileReceived`. Every email ends with `voice.signOff`. Deterministic text |
| `domain/live-session.ts` | `liveSessionSchema`: the serialisable state `/api/chase` reads and returns |
| `domain/sample-documents.ts` | The 9 samples: file name, item id, menu label, recorded `CheckResult`. Type imports only |
| `domain/story-time.ts` | `addDays`, ISO without offset, `formatStoryTime` ("Mon 9 Mar, 12:40") |
| `domain/file-type.ts` | The accepted types by first bytes and the 4,000,000 byte limit, shared by the browser and `/api/check` |
| `domain/checklist-summary.ts` | The firm's summary (headline, problem notes, key figures) and `firmNote` for a problem row, for example "2024 version sent" or "Sent for Amara Okafor" |
| `domain/engagement-terms.ts` | The service and price the engagement letter names, and its contact line |
| `domain/plain-words.ts` | `inSentence`, `withArticle`, `capitalised`: a name like a document type read inside a sentence |

State machine, exactly:

| From | Event | To |
| --- | --- | --- |
| missing | `uploaded` (upload item) | received |
| missing | `signed` (signature item) | checked |
| received | `checkPassed` | checked |
| received | `checkFailed` | problem |
| received | `checkAborted` | the state before `uploaded` |
| problem | `uploaded` | received |
| checked | any | checked, and `transition` reports the event as ignored |
| any upload item | `signed` | unchanged, reported as invalid |
| signature item | `uploaded` | unchanged, reported as invalid |

`checkAborted` covers a network or provider failure; the upload page then says "The check did not finish. Upload the file again."

Check rules, applied in this order, each only when the model did not already report that kind:

1. `year` is a number other than 2025: add `wrong_year`, "Covers {year}. The 2025 version is needed."
2. `person` is not null and, compared without case and extra spaces, is not "Daniel Okafor": add `wrong_person`, "This is for {person}. Daniel Okafor's is needed."
3. The item needs a signature and `signed` is `false`: add `missing_signature`, "The signature is missing."
4. `matchesRequest` is `false`: add `wrong_document`, "This is a {documentType}, not a {item label}.", both in lower case with "a" or "an", for example "This is a donation receipt, not a bank interest statement 2025."
5. `status` becomes `problem` when there is any issue, else `ok`, whatever the model said.

Client reasons, one per outstanding item, first issue wins: missing "Not received yet."; `wrong_year` "You sent the one for {year}."; `wrong_person` "The file you sent is for {person}."; `missing_signature` "The signature is missing."; `missing_page` "A page is missing."; `wrong_document` "The file you sent is a different document."; `unreadable` "Part of it cannot be read. A sharper scan or photo helps."; `other` "Please send a clearer copy or the right document."

File naming: `{year}_{Lastname}-{Firstname}_{File label}[_{first issue kind with hyphens}].{ext}`.
Year and person come from the check result; a null year writes `no-year`, a null person writes `Unknown`.
Names are ASCII (accents transliterated, other characters dropped), spaces become hyphens, at most 80 characters before the extension. A name already in the folder gets `_2`, `_3`.
Sorting: a passing file goes to its item's folder; a problem file goes to `00 Needs attention`; when an item passes, its earlier problem files move to `99 Replaced`. Folders sort by their number prefix, files by name. Empty folders `00` and `99` are hidden.

Reminder schedule (`nextChase`), with `chaseIntervalDays = 3`:

| Session state | Next chase | Due |
| --- | --- | --- |
| Complete or escalated | none | |
| No chase sent, not submitted | follow-up | request sent + 3 days |
| No chase sent, submitted | follow-up | submitted time |
| 1 chase sent | reminder | last chase + 3 days |
| 2 chases sent | escalation to the firm | last chase + 3 days |

Each email lists the items outstanding at send time, not at schedule time.

### application/

| File | Holds |
| --- | --- |
| `application/ports/ocr-service.ts` | `OcrService { name: "claude" \| "google-document-ai"; read(file: UploadedFile): Promise<{ ocrText?: string }> }` and `UploadedFile { name, mediaType, bytes }` |
| `application/ports/job-scheduler.ts` | `JobScheduler { schedule(job: ChaseJob): Promise<void>; cancel(jobId: string): Promise<void> }`, `ChaseJob { id, requestId, runAt }`. Scheduling an existing id replaces it |
| `application/ports/file-store.ts` | `FileStore { save(entry: { folder, fileName, file: UploadedFile }): Promise<{ path: string }> }`. The seam where a client build puts Google Drive |
| `application/check-uploaded-document.ts` | Reads the file through `OcrService`, runs `documentCheckTask` through `buildSystemPrompt` and `AiProvider.generateObject` with the file as an attachment and `ocrText` in the context, passes a `mock` keyed on the file name, applies `applyCheckRules`, names the file, calls `FileStore.save`, returns the result, the item event and the filing |
| `application/chase-missing-documents.ts` | `chaseMissingDocuments({ session, profile, event, now }, { scheduler })` records a submit and schedules the job for `nextChase`; `sendDueChase(job, session, profile)` is the job handler that composes the due email or escalation, appends it to the session and schedules the next one, or cancels when complete |

Model role `analysis` (`claude-sonnet-5-5`) for the check, maximum 1,200 output tokens.

### infrastructure/

| File | Holds |
| --- | --- |
| `infrastructure/claude-document-reader.ts` | `OcrService` named `claude`: returns `{}`, so the check sends the file to Claude as a PDF or image attachment and Claude reads it directly |
| `infrastructure/google-document-ai-ocr.ts` | `OcrService` named `google-document-ai`: calls `processDocument({ name: "projects/{project}/locations/{location}/processors/{processorId}", rawDocument: { content: base64, mimeType } })` on a client created with `apiEndpoint: "{location}-documentai.googleapis.com"`, returns `{ ocrText: document.text }`. Takes the client as a constructor parameter typed `Pick<DocumentProcessorServiceClient, "processDocument">`, so tests pass a fake. Wraps client errors in `OcrError` |
| `infrastructure/ocr-settings.ts` | Reads `OCR_PROVIDER` (`claude` default, or `google-document-ai`) and, for Google, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_DOCUMENT_AI_LOCATION`, `GOOGLE_DOCUMENT_AI_PROCESSOR_ID` with zod. Missing settings or an unknown value throw an error that names each missing variable |
| `infrastructure/in-process-scheduler.ts` | `JobScheduler` on a virtual clock: jobs in a map by id, `advanceTo(time, handler)` runs due jobs in `runAt` order. Seeded from and written back to `session.jobs`, because the demo keeps no server state |
| `infrastructure/fixture-page-fetcher.ts` | The page "Make it yours" reads under the mock provider |
| `infrastructure/simulated-drive-store.ts` | `FileStore` that keeps no bytes and returns the Drive path. The browser draws the folder |
| `infrastructure/container.ts` | The one place that picks adapters: `getProvider()` from `@diepen/ai`, the OCR service from `ocr-settings.ts` (the Google client is loaded with a dynamic `import("@google-cloud/documentai")` only when selected), the simulated Drive store, and `runChase(session, profile, event)`, which seeds the in-process scheduler, calls `chaseMissingDocuments`, then advances the scheduler to now (submitted) or now + 3 days (skip-days) with `sendDueChase` as the handler |

`@google-cloud/documentai` is a dependency of `apps/documents`. Google credentials come from Application Default Credentials. The deployed demo leaves `OCR_PROVIDER` unset.

### ui/

| File | Holds |
| --- | --- |
| `ui/live-demo.tsx` | The `/live` layout: the four lanes, the clock bar with "Skip 3 days" and "Start over", the provider and fallback notes |
| `ui/live-state.ts` | The live page's state and `sessionOf`, the serialisable session `/api/chase` reads |
| `ui/live-session-reducer.ts` | Browser state changes: uploads, check answers, signing, chases. Uses the domain transitions |
| `ui/use-live-demo.ts` | The live page's actions, wired to the two routes, and the story clock |
| `ui/live-toolbar.tsx`, `ui/live-client-lane.tsx`, `ui/live-side-lanes.tsx` | The heading, the clock and its two buttons, and the four live lanes |
| `ui/inbox-emails.ts` | `EmailRecord`, the facts of one email, and `composeInboxEmail`, which writes it with the active profile |
| `ui/replaced-checks.ts` | Which check cards a later passing upload replaced |
| `ui/touch-target.ts` | The 44 px button height on phones |
| `ui/documents-lanes.ts` | The four lanes and their widths, shared by the film and live mode |
| `ui/live-api.ts` | `postCheck(file, itemId, profile)` and `postChase(session, event, profile)`; turns a `{ fallback: "film" }` answer into the fallback state |
| `ui/client-phone.tsx` | The phone frame (9:19, sized by the lane alone, status bar scaled to its width) and the screen inside it, which scrolls to a marked `phoneFocusTarget` |
| `ui/upload-page.tsx` | The DocuSign-style page: header, item rows with state chips, upload, "Use a sample", "Done for now" |
| `ui/upload-item.tsx` | One item row: label, detail, state, reason line, buttons |
| `ui/sample-menu.tsx` | The samples for one item from `domain/sample-documents.ts` |
| `ui/file-guard.ts` | Browser checks for type by first bytes and for size, with the two messages |
| `ui/signature-pad.tsx` | Pointer drawing on a canvas, "Clear", and the typed-name alternative |
| `ui/engagement-letter.tsx` | The letter rendered from the profile, with the signature when signed |
| `ui/check-card.tsx` | One check result in the system lane: Reading, Checked or Problem found, fields, figures, summary |
| `ui/schedule-card.tsx` | The next chase and its date, with the 3 day bar |
| `ui/firm-lane.tsx` | Checklist (`@diepen/ui/mockups/checklist`), the summary card and the escalation task |
| `ui/drive-lane.tsx` | Drive tree with `@diepen/ui/mockups/drive-folder`. Passes `wrapNames`, so long names wrap only after `_` or `-`; the folder path shows the firm and the client on a small line above the open folder. It keeps the newest file in view. A file preview waits for a later version |
| `ui/email-views.tsx` | The request, follow-up and reminder emails with `@diepen/ui/mockups/email-inbox` and `email-message` |

### film/

| File | Holds |
| --- | --- |
| `film/documents-film.ts` | `defineFilmScript<DocumentsBeat>`: lanes, clock, the 40 beats, end card, with `{firm}` and `{owner}` filled from a profile argument |
| `film/documents-beat.ts` | The `DocumentsBeat` union: `checklist`, `email`, `upload-page`, `signature`, `files-dropped`, `check`, `filed`, `summary`, `schedule`, `complete` |
| `film/film-state.ts` | Folds the beats a lane has landed into its view state with the domain functions |
| `film/render-film-lane.tsx` | `renderLane` for `FilmStage`: maps each lane's state to the same `ui/` components live mode uses |
| `film/film-client-lane.tsx`, `film/film-side-lanes.tsx`, `film/film-views.ts` | The film's lanes and the lookups they share |
| `film/documents-film-stage.tsx` | The film inside the demo shell, sized to fit one screen |

### app/

| Route | Kind | Does |
| --- | --- | --- |
| `/` | page | The film in the demo shell. Reads `?t=` and `?brand=` |
| `/live` | page | Live mode. The upload page is a view inside it, not its own route |
| `/api/check` | POST | Checks one uploaded file |
| `/api/chase` | POST | Submits or skips days, returns the chases sent |
| `/api/brand` | POST | `createBrandHandler` from `@diepen/voice/brand-route`, wired in the container. Under the mock provider it reads a fixture page, so tests and keyless runs never fetch the internet |
| `/api/health` | GET | `{ ok: true, app: "documents", provider: "claude" \| "mock", ocr: "claude" \| "google-document-ai" }`; 500 with the missing variable names when the OCR settings are invalid |
| `/icon.svg` | file | `app/icon.svg`, the tab icon. With it the browser asks for no `/favicon.ico` |

`POST /api/check` takes `multipart/form-data`, not base64 JSON, because base64 would cut the usable file size by a third under the 4.5 MB body limit.

| Field | Type | Rule |
| --- | --- | --- |
| `file` | File | Required. Type by first bytes, at most 4,000,000 bytes |
| `itemId` | string | One of the 5 upload item ids. `engagement-letter` is rejected |
| `profile` | string | Optional JSON, parsed with `companyProfileSchema`. Absent means the default preset |

Order in the route: read the body with `readBodyBytes` from `@diepen/ai/request-body` under 4,400,000 bytes (a declared `content-length` over it, or more bytes than that, answers 413 before more is read); parse the multipart form from those bytes; validate with zod; check type and size; `guards.check`; call the use case through the container.

| Status | Body |
| --- | --- |
| 200 | `{ check: CheckResult, itemEvent: "checkPassed" \| "checkFailed", filing: { folder: string, fileName: string }, provider: "claude" \| "mock", ocr: "claude" \| "google-document-ai" }` |
| 400 | `{ error: "invalid_request", issues: string[] }` |
| 413 | `{ error: "file_too_large", maxBytes: 4000000 }` |
| 415 | `{ error: "unsupported_file_type", accepted: ["application/pdf", "image/png", "image/jpeg"] }` |
| 429 | `{ fallback: "film", reason, message }` from `fallbackResponse` |
| 503 | `{ fallback: "film", reason: "unavailable", message }` from `unavailableResponse` when the provider or OCR throws |

`POST /api/chase` takes JSON, at most 64 KB, read with `readBodyText` under that cap.

| Field | Type | Rule |
| --- | --- | --- |
| `session` | `LiveSession` | `liveSessionSchema` |
| `event` | `"submitted" \| "skip-days"` | Required |
| `profile` | `CompanyProfile` | Optional, default preset when absent |

`LiveSession` is `{ requestId, sentAt, now, submittedAt?, items: { id, state, issues: { kind }[], detectedYear: number \| null, detectedPerson: string \| null }[], chases: { id, kind, sentAt }[], jobs: { id, runAt }[], escalated: boolean }`. It holds no file content and no check summaries.

| Status | Body |
| --- | --- |
| 200 | `{ session: LiveSession, sent: { id, kind: "follow-up" \| "reminder" \| "escalation", to: "client" \| "firm", sentAt, subject, body, outstanding: { itemId, reason }[] }[] }` |
| 400 | `{ error: "invalid_request", issues: string[] }` |
| 413 | `{ error: "body_too_large", maxBytes: 65536 }` |

## 7. Layout

Film and live use the same lane layout.

| Viewport | Film | Live |
| --- | --- | --- |
| 1920x1080 | Four lanes side by side in one row: Firm 30%, Client 21% (phone frame), System 22%, Drive 27%. Caption bar under the lanes; body text at least 16 px so it reads in a 1080p video. Header, lanes, caption and controls fit without page scroll | Same lanes, no caption bar; the clock bar carries "Skip 3 days" and "Start over" |
| 1440x900, and 1280x720 (a 1080p screen at 150% zoom, where the film is recorded with `?record=1`) | Same four lanes. Firm and Drive zoom their content out a step as the lane gets shorter (to 0.9, 0.8, 0.74 and 0.68 of full size), so all 6 checklist rows and the summary read whole and Drive names wrap on two or three lines. The phone content zooms out a step on a phone narrower than 260 px. The system lane shows the newest cards and fades the older ones out at the top | Same; the upload page scrolls inside the phone frame |
| 375 px wide | One lane at a time with the shared `LaneTabs` (Firm, Client, System, Drive). The tab follows the active beat; a tapped tab pins until the next caption. Travel shows as the tab's receiving dot. The film is one screen high: caption above the lane, controls below, no page scroll. The firm lane puts its cards above the checklist | The client lane is full width without the phone frame. Each lane is as long as its content and the page scrolls; the clock, "Skip 3 days" and the tabs stick to the top. Tabs show a dot when another lane changed |

The phone frame keeps a 9:19 shape at a size set by the lane alone: as tall as the lane allows, never wider than the lane, at most 820 px tall. Its status bar, island and corners scale with its width, so the clock never meets the island.

At 375 px nothing overflows: `document.documentElement.scrollWidth` is at most 375 in every view, long file names truncate with an ellipsis in the middle, check card figures wrap, and the signature pad is the content width.
Every button the visitor taps on a phone is at least 44 px high.

## 8. Acceptance checks

Unit checks run in Vitest with `AI_PROVIDER=mock`. Flow checks run in Playwright against the mock provider. Each test title carries its feature tag, for example `@documents.chase`.

### Unit

1. `@documents.upload` The state machine follows the table in section 6 for every row, including ignored and invalid events and `checkAborted` returning to the earlier state.
2. `@documents.upload` `outstanding` returns missing and problem items in checklist order; `isComplete` is true only when all 6 are checked.
3. `@documents.problem` `applyCheckRules` adds `wrong_year`, `wrong_person`, `missing_signature` and `wrong_document` when the model missed them, never adds a kind twice, ignores a null year or person, and sets `status` from the issues.
4. `@documents.upload` `fileNameFor` returns `2025_Okafor-Daniel_Payslip-summary.pdf`, `2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf`, `.png` for an image, `no-year` and `Unknown` for nulls, ASCII only, at most 80 characters before the extension.
5. `@documents.problem` `fileIntoDrive` puts a passing file in its item folder and a problem file in `00 Needs attention`, moves the item's earlier problem files to `99 Replaced` when it passes, adds `_2` to a duplicate name, and orders folders by prefix and files by name.
6. `@documents.chase` `nextChase` returns each row of the reminder table, with dates exactly 3 days apart, and `null` when complete or escalated.
7. `@documents.chase` `followUpEmail` for the film's state lists exactly the bank, home office and health insurance items with their client reasons, says "3 documents" in the subject, and ends with the profile's `signOff`. No composed email, caption or reason contains "—" or "–".
8. `@documents.upload` `checkUploadedDocument` with the mock provider and fake ports returns each sample's recorded result for its file name, saves once through the fake `FileStore` with the expected folder and name, and returns the right item event.
9. `@documents.own-file` An unknown file name returns the generic mock result and `checkFailed`.
10. `@documents.upload` When the fake `OcrService` returns `ocrText`, the AI request carries it in the context and still attaches the file.
11. `@documents.chase` `runChase` with the in-process scheduler: `submitted` with outstanding items sends the follow-up at once; `skip-days` then sends the reminder; `skip-days` again sends the escalation to the firm; once more sends nothing. A complete session sends nothing and leaves no job.
12. `@documents.chase` The in-process scheduler runs due jobs in `runAt` order, replaces a job with the same id, and a cancelled job never runs.
13. `@documents.upload` `ocr-settings` selects `claude` when `OCR_PROVIDER` is unset or `claude`, `google-document-ai` when it is set with all three Google settings, and throws an error naming each missing variable or the unknown value.
14. `@documents.upload` The Google adapter with a fake client sends the processor name, the base64 content and the MIME type, uses the location's API endpoint, returns `document.text`, and wraps a client error in `OcrError`.
15. `@documents.upload` The Claude reader returns `{}` and never touches the bytes.
16. `@documents.own-file` `POST /api/check` answers 400 without a file, for an unknown item or for `engagement-letter`, and for invalid profile JSON; 413 for 4,000,001 bytes and for a `content-length` over 4,400,000; 415 for a text file named `.pdf`; 200 with the response shape for each sample; 429 `{ fallback: "film" }` when the guard trips. A request that fails validation does not count against the guard.
17. `@documents.chase` `POST /api/chase` answers 400 for an invalid session or event, 413 over 64 KB, and 200 with the response shape.
18. `@documents.upload` `buildFixtures()` returns bytes whose SHA-256 equals each committed file in `public/fixtures/`; every PDF page contains the text "SAMPLE"; every file is under 300 KB; every sample in `domain/sample-documents.ts` has a file.
19. `@documents.upload` Every recorded result parses with `CheckResult` and keeps its `status` after `applyCheckRules`. The voice task's `DocumentCheck` type equals `CheckResult` (`expectTypeOf`).
20. `@documents.film` The film script passes `defineFilmScript`, runs 60,000 to 90,000 ms, has no caption over 80 characters with the default preset, has no "—" or "–", and folding all beats leaves 6 of 6 checked and the Drive tree of section 2.

### Flow

21. `@documents.film` `/` plays to the end card at the fastest speed: "Hours a month spent chasing documents", "12 hours", "1 hour" and the note starting "Simulation with a fictional firm" show. The film makes no request to `/api/check` or `/api/chase`.
22. `@documents.controls` Pause holds the clock text for 1 second; play moves it; restart shows "Mon 9 Mar, 09:00" and the first caption; each speed setting changes the pace.
23. `@documents.controls` `/?t=27000` opens after beat 19 has landed (its 700 ms flight ends at 27,000 ms): the wrong-year caption, the bank row Problem found in the firm lane, and the clock at "12:47".
24. `@documents.upload` On `/live`, opening the email, "Upload and sign" and "Use a sample" with `payslip-summary-2025.pdf` shows Checked on the upload page, "Gross pay" in the system lane, `2025_Okafor-Daniel_Payslip-summary.pdf` in `02 Income`, and the firm row Checked. The provider note shows.
25. `@documents.upload` Each passing sample (bank 2025, donation, home office signed, health insurance PNG) ends Checked through a file input upload of the file from `public/fixtures/`.
26. `@documents.problem` Each of the 4 problem samples shows Problem found with its reason line on the upload page and its file in `00 Needs attention`. Uploading the matching passing sample afterwards turns the item Checked and moves the problem file to `99 Replaced`.
27. `@documents.sign` "Sign" is disabled until a mouse stroke on the pad or a typed name; signing turns the letter Checked and adds `2025_Okafor-Daniel_Engagement-letter_signed.pdf` to `01 Engagement` with no request to the server.
28. `@documents.chase` After signing and uploading the payslip, bank 2024, donation and unsigned home office samples, "Done for now" puts a follow-up in the inbox whose list holds exactly 3 items: bank interest statement, home office confirmation, health insurance statement.
29. `@documents.chase` "Skip 3 days" then moves the clock to "Thu 12 Mar" and delivers the reminder with the same 3 items; a second skip puts the escalation task in the firm lane and disables "Skip 3 days".
30. `@documents.chase` Completing all 6 items and pressing "Done for now" sends no email and shows "Complete. Ready to prepare the return."
31. `@documents.own-file` Uploading a small generated PDF named `my-file.pdf` shows the generic demo answer; a 4,000,001 byte file shows "Files up to 4 MB." and a `.txt` file shows "Use a PDF, PNG or JPEG.", both without a request to `/api/check`.
32. `@documents.fallback` With `/api/check` routed to answer 429 `{ fallback: "film" }`, an upload swaps the live page to the film with the fallback note.
33. `@documents.brand` With another preset applied through "Make it yours" (or `?brand=`), the email sender, the upload page header, the Drive root and the upload page's primary button colour use that profile, and the `profile` field sent to `/api/check` carries its name. A profile stored in local storage on an earlier visit writes the request email on a fresh load.
34. `@documents.film` `@documents.upload` At 375x812, `/` at `?t=0`, `20000`, `37500`, `57500` and `61000`, and `/live` in the inbox, upload page, letter and each lane tab, have `scrollWidth` at most 375. The tabs read Firm, Client, System, Drive.
35. `@documents.film` `@documents.upload` At 1920x1080 and 1440x900, all four lanes and the caption bar lie inside the viewport on `/`, and all four lanes on `/live`.
36. `@documents.film` `@documents.upload` No console error or page error on `/` through the whole film or on `/live` through checks 24, 27 and 28.

## 9. Feature rows

| Id | A user can | Reach it | As | Status |
| --- | --- | --- | --- | --- |
| `documents.film` | Watch the 72 second film from request to complete checklist, ending on hours a month spent chasing documents | `/` | anon | shipped |
| `documents.controls` | Pause, play, restart and change the speed of the film, and open it at a moment with `?t=` | `/`, film controls, `/?t=27000` | anon | shipped |
| `documents.upload` | Open the request email, upload a sample or own file for an item, and see the check, the Drive folder and the firm checklist update | `/live`, "Upload and sign" | anon | shipped |
| `documents.problem` | Upload a problem sample, see Problem found with the reason, then fix it with the right file | `/live`, "Use a sample" | anon | shipped |
| `documents.sign` | Sign the engagement letter on the upload page and see the signed copy filed | `/live`, "Review and sign" | anon | shipped |
| `documents.chase` | Get the follow-up that names what is missing, skip 3 days for the second reminder, then see the escalation to the firm | `/live`, "Done for now", "Skip 3 days" | anon | shipped |
| `documents.own-file` | Upload their own PDF, PNG or JPEG up to 4 MB for one check that keeps no copy | `/live`, "Upload" | anon | shipped |
| `documents.brand` | See live mode in their own company's name, logo, colours and voice | `/live`, "Make it yours" | anon | shipped |
| `documents.fallback` | See the film with a short note when the live demo hits its limit | `/live` | anon | shipped |

No id is a prefix of another followed by `-` or `.`, because `verify flow` greps `@<id>\b` and would also run the longer id's tests.

## 10. Open questions

| Question | Default we use |
| --- | --- |
| Do the follow-up and reminder emails come from Claude in the firm's voice? | No. A domain template writes them, so the list of missing items is exact, the film and live mode match, and a chase costs no tokens. A `@diepen/voice/tasks/document-follow-up` task can add the voice later |
| Does "Make it yours" change the requested documents to fit the visitor's industry? | No. The 6 tax return items stay, because the samples and the end card number are about tax returns |
| Is the upload page its own route? | No. It is a view inside `/live`, so the session needs no URL state and the feature map has two page routes |
| How does a client build authenticate Google Document AI on Vercel? | Application Default Credentials through Vercel's OIDC and Google Workload Identity Federation. The demo deploy leaves `OCR_PROVIDER` unset and needs nothing |
| Does the live session survive a reload? | No. It lives in browser memory; "Start over" and a reload begin again |
| Where does the check result type live? | `domain/check-result.ts`, with a type test that fails when the voice task's `DocumentCheck` differs. The domain imports only `@diepen/voice/profile`, as AGENTS.md says |
| Does the escalation after the second reminder belong in the demo? | Yes, as one task card in the firm lane after a second "Skip 3 days". The film ends before it |
| Can a client replace a file on a Checked item? | No. Checked is final in the demo |
| Currency and date format | EUR and "Mon 9 Mar, 12:40", matching the Munich preset |
