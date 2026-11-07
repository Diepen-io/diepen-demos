# Packages

The public modules of the three shared packages.
Import each by its path, for example `@diepen/ui/film/keynote-stage`.
There are no index files.

## @diepen/ai

The bottom layer. It imports nothing else from this repo and is the only code that talks to Anthropic.

| Module | Holds |
| --- | --- |
| `provider` | The `AiProvider` port: `streamText`, `generateText`, `generateObject`, and the request and attachment types |
| `models` | Which model does which job: `chat` is Haiku, `analysis` is Sonnet |
| `provider-factory` | `getProvider()` (cached), `createProvider(env)`, `activeProviderName()`. Mock when `AI_PROVIDER=mock` or no key |
| `claude-provider` | The Claude adapter. Takes the client as a parameter. Server-side refusal fallbacks on for Sonnet |
| `mock-provider` | The mock adapter. Answers with the request's `mock()`, checked against the schema |
| `guards` | Cost guards: `createGuards(options)`, the shared `guards`, `check(request)`, `clampMaxTokens` |
| `route-responses` | `fallbackResponse` (429 with `{ fallback: "film" }`: the app sends the visitor to the film), `unavailableResponse` (503, reason `unavailable`: the visitor stays and tries again), `textStreamResponse` |
| `request-body` | `readBodyBytes(request, maxBytes)` and `readBodyText`: read a route's body under a byte cap, checked on `content-length` and again while chunks arrive, else `BodyTooLargeError`. The bytes sit in a plain `ArrayBuffer`, so they go straight into a `Response` or a `Blob` |
| `text-stream-client` | Browser-safe: `readTextStream`, `readFallback`, `isGuardTrip(response)` (true only for a tripped cost guard, the one answer that sends the visitor to the film), `providerOf`. The only module app UI may import |
| `errors` | `AiUnavailableError`, `AiRefusalError`, `AiOutputError`, `isAiError` |

A route validates its input, runs `guards.check(request)`, calls one use case with the provider from the container, and maps `isAiError` to `unavailableResponse`.

## @diepen/voice

The company profile and everything that turns it into prompts.

| Module | Holds |
| --- | --- |
| `profile` | `companyProfileSchema` and `CompanyProfile` |
| `presets` | Three fictional companies: Ottervale Dental (inbox), Ledgerwick Accounting (documents), Brickfern Property Management (meetings). `presets`, `presetList`, `defaultPresetFor(demo)` |
| `prompt` | `buildSystemPrompt({ profile?, task, context })`. Every system prompt in every demo comes from here |
| `task-spec` | The `TaskSpec` type |
| `tasks/inbox-reply`, `tasks/document-check`, `tasks/call-outputs`, `tasks/brand-extraction` | One AI task each: instructions, output schema, context type. `call-outputs` also exports `buildCallOutputsRequest` |
| `brand-extraction` | The use case `extractBrandProfile({ url, fetchPage, provider })`. When the page names no person, the owner is `teamOwner` ("the team", role "Team"), never "The owner" |
| `brand-route` | `createBrandHandler({ fetchPage, provider?, guards? })`. It reads at most `maxBrandRequestBytes` (4096) and answers every error as `{ message }` for the panel: 400, 413, 422 (page not readable), 429 ("Live answers are paused for now. Fill in the form instead.") and 503. Each app's `app/api/brand/route.ts` builds it from the container's `fetchPage`, `provider` and `guards` |
| `fixture-page-fetcher` | `fixturePageFetcher`, a made-up page for any address, and `pageFetcherFor(providerName)`: the fixture page under the mock provider, else the real `fetchPage`. Each container picks its fetcher with it |
| `page-fetcher` | The `PageFetcher` port and its adapter: public addresses only, checked on every redirect, size and time caps |
| `html-signals` | Title, meta, colours, icons and visible text from one page, in linear time |
| `profile-codec` | Browser-safe `encodeProfile` and `decodeProfile` for the `?brand=` parameter and local storage. An unchanged preset travels as its id (`?brand=ottervale-dental`); any other profile as base64url JSON. `decodeProfile` reads both |
| `person-name` | `firstName(fullName)` skips titles ("Dr. Lena Okafor" gives "Lena") and keeps a group name such as "the team" whole. `teamOwner` is the owner of a draft whose website names no person |
| `color-contrast` | `readableForeground`, `contrastRatio` |

## @diepen/ui

The design system. It never imports `@diepen/ai`.

| Folder | Holds |
| --- | --- |
| `film/` | The keynote engine: `defineKeynoteFilm`, `KeynoteStage`, `KeynoteFilmView` and the parts in `keynote-parts`. Shared: `useFilm` and `film-playback`. `?t=<ms>` opens paused at that moment. Also `useNarrowScreen`, `usePrefersReducedMotion` and `EASE_OUT`, which live pages use. Details below |
| `mockups/` | `EmailInbox`, `EmailMessage`, `InstagramDm`, `LinkedinDm`, `ChatWidget`, `ChannelTabs`, `Calendar`, `DriveFolder`, `Transcript`, `Checklist`, `Composer`, slot and starter chips. Details below |
| `brand/` | `BrandProvider` and `useBrand` (details below), `BrandMark`, `FictionalBadge` (plain faint words "Fictional company", or "Fictional" with `short`, for phones; no pill), `MakeItYours` (`presets` limits the example companies, decision F3), `requestBrandProfile`, and `brand-link` (`shareLink`, `pathWithBrand`) |
| `guide/` | `GuideBar` in `guide-bar`: live mode's guide (decision G1). It has no tint or border; only the `sticky` bar gets a surface and a shadow, because it floats over content. It shows "Step N of M", one short instruction, and one large brand button for the next action; a step that points with the ring names the spot in its text, and while the demo works the bar says "One moment". A step with `onStartOver` is the end: "Start over" and a quieter "Watch the film" link. A new step id scrolls the spotlight into view. `sticky` keeps the bar at the top of a page that scrolls. `spotlight(active, "outside" \| "inset")` in `spotlight` marks the one element to use with `data-spotlight`, which `styles.css` draws as a 2 px brand ring with a soft halo that breathes, and stays still under `prefers-reduced-motion` |
| `shell/` | `DemoShell` (Watch or Try it switch, a quiet "Make it yours" with the `presets` the page passes, footer; one set of gutters in both modes; on phones the company name may take two lines and a short "Fictional" chip sits beside the title), `PageTitle` (an h2 under `DemoShell`, whose title is the page's h1, and an h1 on a page without the shell), `useRecordMode` (`?record=1`), `useFilmFallback` and `filmFallbackHref` in `film-fallback` (send the visitor to the film with `?fallback=limit` after a tripped cost guard), `FallbackNote` (`?fallback=limit`), `ProviderNote` ("You see sample answers. The AI is off here." under the mock provider) |
| `primitives/` | `Button` and `buttonClassName` (the button look for a link), `Input`, `Textarea`, `Field`, `Badge` and `StatusBadge` (`size` "md" or "lg"), `Avatar`, `Icon`, `Sheet`, `Segmented`, `cx` |

### Brand provider

`BrandProvider` takes `defaultProfile`, `brandParamValue` (the page's own `?brand=` from searchParams, so the server renders a shared preset id or custom profile on first paint), `fixed`, `livePath` (default `/live`) and `className`.

| Mode | Shows | Applying a profile or preset in "Make it yours" |
| --- | --- | --- |
| Default, for live pages | `?brand=`, then local storage, then `defaultProfile` | Saves it in local storage and `?brand=`, and the page shows it at once |
| `fixed`, for film pages (decision F1) | Always `defaultProfile`, whatever `?brand=` or local storage hold | Saves it as usual, then opens `livePath?brand=<profile>` |

`useBrand()` returns:

| Field | Holds |
| --- | --- |
| `profile` | The company this page shows. Render the page from this |
| `savedProfile` | The visitor's own profile. Equal to `profile` outside fixed mode. "Make it yours" edits this one |
| `defaultProfile`, `fixed` | The props |
| `setProfile`, `resetProfile` | Apply or clear the visitor's profile |
| `hrefWithBrand(path)` | A same-site link that keeps `savedProfile`, for the Watch and Try it switch and "Try it yourself". On a film page it carries the visitor's profile into live mode |
| `shareHref()` | The absolute "Copy link" address: always carries `savedProfile`, also when it came from local storage, and drops `t`, `fallback` and `record`. In fixed mode it points at `livePath` |

### Keynote films

Every film renders through `KeynoteStage` (`film/keynote-stage`): one element on screen per beat, like a product shot, on a soft wash of the brand colour (decision F2).
The inbox film is the reference: `apps/inbox/film/inbox-keynote.tsx` builds the script and `apps/inbox/app/page.tsx` renders it with `KeynoteFilmView`.

The rules the engine holds a film to:

1. Exactly 4 beats (`KEYNOTE_BEATS`), then the finale. Each beat and the finale stay on screen for `beatMs` (default `KEYNOTE_DEFAULT_BEAT_MS`, 3200 ms), so a four-beat film runs 16 s.
2. One caption per beat, at most 6 words (`KEYNOTE_MAX_CAPTION_WORDS`), no em or en dash. One element under it and at most one chip.
3. The finale shows one number, before and after, the large "Try it yourself" link and one note that says the numbers come from a simulation with a fictional company.

`defineKeynoteFilm` throws on a broken script, so the film's unit test fails.

| Module | Holds |
| --- | --- |
| `film/keynote-script` | The types below, `defineKeynoteFilm`, `KEYNOTE_BEATS`, `keynoteBeatMs(film)`, `keynoteDurationMs(film)`, `keynoteStepAt(film, t)` (a beat index, or `beats.length` for the finale), `KEYNOTE_MAX_CAPTION_WORDS`, `KEYNOTE_DEFAULT_BEAT_MS` |
| `film/keynote-stage` | `KeynoteStage` |
| `film/keynote-film-view` | `KeynoteFilmView({ film })`: the stage under the demo shell, sized to the space under its header, with "Try it yourself" at `hrefWithBrand("/live")`. A film page builds the film on the server from its own preset (decision F1) and passes it in |
| `film/keynote-parts` | The elements a beat shows. Large and chrome-free; text starts at 18 px so it reads in a phone feed |
| `film/keynote-controls` | `KeynoteControls`: Previous beat, Play, Pause or Replay, Next beat (44 px icon buttons) and one dot button per beat, named "Beat N of M: {caption or finale label}" with `aria-current="step"` on the current one. A recording shows the dots only |
| `film/use-film`, `film/film-playback` | Playback. `?t=<ms>` opens paused at that moment. Space toggles, R restarts, the arrow keys go to the previous or next beat start (`beatStart`), except in a text field or a dialog. A seek keeps a playing film playing and a paused one paused |
| `film/use-stage-environment` | `usePrefersReducedMotion` and `useNarrowScreen` (below 768 px): false on the server and the first client render, so hydration matches, then the real value |
| `film/film-easing` | `EASE_OUT`, the `--ease-out` curve of `styles.css` for the Web Animations API |

Types:

```ts
type KeynoteChipTone = "neutral" | "pass" | "wait" | "fail" | "brand";

type KeynoteBeat = {
  id: string;
  caption: string; // at most 6 words
  element: ReactNode; // the one element on screen, usually a part from keynote-parts
  chip?: { label: string; tone?: KeynoteChipTone };
};

type KeynoteFinale = {
  label: string; // what the number measures, for example "Reply time"
  before: string; // "9 h"
  after: string; // "38 s"
  note: string; // one line: a simulation with a fictional company
};

type KeynoteFilm = { id: string; title: string; beats: KeynoteBeat[]; finale: KeynoteFinale; beatMs?: number };
```

`KeynoteStage` props: `film`, `liveHref` (the "Try it yourself" target, default `/live`; pass `hrefWithBrand("/live")`), `autoplay` (default true), `className` (the stage is `h-dvh`; an app sizes it to the space under the shell header).
The stage is a region named by `film.title` with `data-keynote-film`. The step on screen carries `data-keynote-step` with its index, and the finale `data-keynote-finale`.
Under the step sit Play, Pause or Replay and one dot per step that jumps to it. `useFilm` keys work too: Space, R, and the arrows, which move one beat.
Each step rises in over 320 ms (`keynote-rise` in `styles.css`); under reduced motion it only fades.
Under `?record=1` the controls go and the stage header shows the brand mark at 52 px, so a monogram stays above 16 px, the company name and `FictionalBadge`.
The finale keeps before, arrow and after on one line at every width, and the note wraps balanced.
`KeynoteFigures` puts each value on top and its label below, so the values share one line whatever the labels' length.

Parts in `film/keynote-parts`:

| Part | Shows |
| --- | --- |
| `KeynoteChip` | The beat's status chip; the stage draws it from `beat.chip` |
| `KeynoteBubble` | One message: `name`, `text`, `from` ("customer" left, "business" right in the brand colour), `channel`, `initials` |
| `KeynoteNotification` | A phone-style notification: `icon`, `app`, `title`, `body` |
| `KeynoteRow` | One file or checklist row: `icon`, `title`, `status` ("pass", "fail" or "wait") |
| `KeynoteFileStack` | A small stack of file chips: `names` |
| `KeynoteSlot` | One calendar slot: `day`, `time`, `title` |
| `KeynoteCard` | A call or a proposal: `icon`, `eyebrow`, `title`, `value`, `lines` |
| `KeynoteFigures` | Up to three big figures side by side: `figures` of `{ value, label }` |

The inbox film, shortened:

```tsx
// apps/inbox/film/inbox-keynote.tsx
export function buildInboxKeynote(profile: CompanyProfile): KeynoteFilm {
  return defineKeynoteFilm({
    id: "inbox",
    title: "Inbox autopilot",
    beats: [
      { id: "dm", caption: "Saturday, 22:14. A new DM.", element: <KeynoteBubble name="Priya Shah" channel="Instagram" from="customer" text={textOf("C2-1", profile)} /> },
      { id: "answered", caption: `Answered in ${priyaReplySeconds()} seconds.`, element: <KeynoteBubble name={profile.people.assistantName} from="business" text={textOf("C2-2", profile)} /> },
      // "booked" with a KeynoteSlot, "edge-case" with a KeynoteNotification
    ],
    finale: { label: "Reply time", before, after, note: `A simulation with ${profile.name}, a fictional company. ...` },
  });
}

// apps/inbox/app/page.tsx (a server component)
const company = defaultPresetFor("inbox");
<KeynoteFilmView film={buildInboxKeynote(company)} />
```

Compute every number a film shows from the fixtures or the decision behind it (the inbox uses `domain/metrics.ts`, documents `domain/chase-hours.ts`), never type it in.

### Mockups

- Slot chips that can be picked are 44 px tall on phones. They take `disabled`: unpicked times turn grey and are not buttons, and the list carries `data-disabled`. Every conversation mockup sets it while `handover` is set, so after a handover no app has to dim or unhook the chips itself.
- `Composer`: on phones (below 640 px) every field and button is at least 44 px tall. With `maxLength` (from `ConversationControls.maxLength`) the field stops there and counts down over the last 100 characters. The fields are named `message` and `subject`. The email composer is compact there: two lines and a round Send button beside them, without the attachment and shortcut row, so the thread keeps its room.
- `DriveFolder` shows the parent folders as a small muted line that wraps and the open folder on its own line under it, and counts "1 file" in the singular. With `wrapNames`, a file name breaks only after `_` (a `<wbr>`) or `-`, never inside a word.
- `SlotChips`: with `ConversationControls.spotlightSlots` (and `slotsSpotlight` on `EmailMessage`) the times that are still open to pick carry the live guide's spotlight.
