# Packages

The public modules of the three shared packages.
Import each by its path, for example `@diepen/ui/film/film-stage`.
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
| `guards` | Cost guards: `createGuards(options)`, the shared `guards`, `check(request)`, `clampMaxTokens`, `checkInputSize` |
| `route-responses` | `fallbackResponse` (429 or 413 with `{ fallback: "film" }`), `unavailableResponse` (503), `textStreamResponse` |
| `request-body` | `readBodyBytes(request, maxBytes)` and `readBodyText`: read a route's body under a byte cap, checked on `content-length` and again while chunks arrive, else `BodyTooLargeError`. The bytes sit in a plain `ArrayBuffer`, so they go straight into a `Response` or a `Blob` |
| `text-stream-client` | Browser-safe: `readTextStream`, `readFallback`, `providerOf`. The only module app UI may import |
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
| `brand-route` | `createBrandHandler({ fetchPage, provider?, guards? })` and the default `handleBrandRequest` |
| `page-fetcher` | The `PageFetcher` port and its adapter: public addresses only, checked on every redirect, size and time caps |
| `html-signals` | Title, meta, colours, icons and visible text from one page, in linear time |
| `profile-codec` | Browser-safe `encodeProfile` and `decodeProfile` for the `?brand=` parameter and local storage. An unchanged preset travels as its id (`?brand=ottervale-dental`); any other profile as base64url JSON. `decodeProfile` reads both |
| `person-name` | `firstName(fullName)` skips titles ("Dr. Lena Okafor" gives "Lena") and keeps a group name such as "the team" whole. `teamOwner` is the owner of a draft whose website names no person |
| `color-contrast` | `readableForeground`, `contrastRatio` |

## @diepen/ui

The design system. It never imports `@diepen/ai`.

| Folder | Holds |
| --- | --- |
| `film/` | The keynote engine: `defineKeynoteFilm`, `KeynoteStage` and the parts in `keynote-parts`. Shared: `useFilm` and `film-playback`. `?t=<ms>` opens paused at that moment. Also `Lane` and `LaneTabs`, which documents live mode uses. Details below |
| `mockups/` | `EmailInbox`, `EmailMessage`, `InstagramDm`, `LinkedinDm`, `ChatWidget`, `ChannelTabs`, `Calendar`, `DriveFolder`, `CrmCard`, `Transcript`, `ProposalDocument`, `Checklist`, `Composer`, slot and starter chips. Details below |
| `brand/` | `BrandProvider` and `useBrand` (details below), `BrandMark`, `FictionalBadge`, `MakeItYours`, `requestBrandProfile`, and `brand-link` (`shareLink`, `pathWithBrand`) |
| `shell/` | `DemoShell` (Film or Live switch, "Make it yours", footer), `PageTitle` (an h2 under `DemoShell`, whose title is the page's h1, and an h1 on a page without the shell), `useRecordMode` (`?record=1`), `FallbackNote` (`?fallback=limit`), `ProviderNote` |
| `primitives/` | `Button`, `Input`, `Textarea`, `Field`, `Badge` and `StatusBadge` (`size` "md" or "lg"), `Avatar`, `Icon`, `Sheet`, `Segmented`, `cx` |

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
| `hrefWithBrand(path)` | A same-site link that keeps `savedProfile`, for the Film and Live switch and "Try it live". On a film page it carries the visitor's profile into live mode |
| `shareHref()` | The absolute "Copy link" address: always carries `savedProfile`, also when it came from local storage, and drops `t`, `fallback` and `record`. In fixed mode it points at `livePath` |

### Keynote films

Every film renders through `KeynoteStage` (`film/keynote-stage`): one element on screen per beat, like a product shot, on a soft wash of the brand colour (decision F2).
The inbox film is the reference: `apps/inbox/film/inbox-keynote.tsx` builds the script and `apps/inbox/ui/inbox-film.tsx` renders it.

The rules the engine holds a film to:

1. 1 to 4 beats, then the finale. Each beat and the finale stay on screen for `beatMs` (default `KEYNOTE_DEFAULT_BEAT_MS`, 3200 ms), so a four-beat film runs 16 s.
2. One caption per beat, at most 6 words (`KEYNOTE_MAX_CAPTION_WORDS`), no em or en dash. One element under it and at most one chip.
3. The finale shows one number, before and after, the "Try it live" link and one note that says the numbers come from a simulation with a fictional company.

`defineKeynoteFilm` throws on a broken script, so the film's unit test fails.

| Module | Holds |
| --- | --- |
| `film/keynote-script` | The types below, `defineKeynoteFilm`, `keynoteBeatMs(film)`, `keynoteDurationMs(film)`, `keynoteStepAt(film, t)` (a beat index, or `beats.length` for the finale), `KEYNOTE_MAX_CAPTION_WORDS`, `KEYNOTE_DEFAULT_BEAT_MS` |
| `film/keynote-stage` | `KeynoteStage` |
| `film/keynote-parts` | The elements a beat shows. Large and chrome-free; text starts at 18 px so it reads in a phone feed |
| `film/use-film`, `film/film-playback` | Playback. `?t=<ms>` opens paused at that moment |
| `film/use-stage-environment` | `usePrefersReducedMotion`: false on the server and the first client render, so hydration matches, then the real value |

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

`KeynoteStage` props: `film`, `liveHref` (the "Try it live" target, default `/live`; pass `hrefWithBrand("/live")`), `autoplay` (default true), `className` (the stage is `h-dvh`; an app sizes it to the space under the shell header).
The stage is a region named by `film.title` with `data-keynote-film`. The step on screen carries `data-keynote-step` with its index, and the finale `data-keynote-finale`.
Under the step sit Play, Pause or Replay and one dot per step that jumps to it. `useFilm` keys work too: Space, R, and the arrows, which move one beat.
Each step rises in over 320 ms (`keynote-rise` in `styles.css`); under reduced motion it only fades.
Under `?record=1` the controls go and the stage header shows the brand mark, the company name and `FictionalBadge`.

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
      { id: "answered", caption: "Answered in 38 seconds.", element: <KeynoteBubble name={profile.people.assistantName} from="business" text={textOf("C2-2", profile)} />, chip: { label: "Replied in 38 s", tone: "pass" } },
      // "booked" with a KeynoteSlot, "edge-case" with a KeynoteNotification
    ],
    finale: { label: "Reply time", before, after, note: `A simulation with ${profile.name}, a fictional company. ...` },
  });
}

// apps/inbox/ui/inbox-film.tsx
const film = useMemo(() => buildInboxKeynote(profile), [profile]);
<KeynoteStage film={film} liveHref={hrefWithBrand("/live")} />
```

Compute the finale numbers from the fixtures (the inbox uses `domain/metrics.ts`), never type them in.

### Mockups

- Slot chips that can be picked are 44 px tall on phones. They take `disabled`: unpicked times turn grey and are not buttons, and the list carries `data-disabled`. Every conversation mockup sets it while `handover` is set, so after a handover no app has to dim or unhook the chips itself.
- `Composer`: on phones (below 640 px) every field and button is at least 44 px tall. The email composer is compact there: two lines and a round Send button beside them, without the attachment and shortcut row, so the thread keeps its room.
- `DriveFolder` shows the parent folders as a small muted line that wraps and the open folder on its own line under it, and counts "1 file" in the singular. With `wrapNames`, a file name breaks only after `_` (a `<wbr>`) or `-`, never inside a word.
