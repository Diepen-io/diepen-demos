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
| `film/` | The focus engine every film moves to: `defineFocusFilm`, `FocusStage`, `highlightProps`, `clockForBeats`. Shared: `useFilm`, `EndCard`, `FilmClock`, `FilmControls`. The lane engine (`FilmStage`, `defineFilmScript`, `LaneFeed`, `CaptionBar`, travel) until documents and meetings move. `?t=<ms>` opens paused at that moment. Details below |
| `mockups/` | `EmailInbox`, `EmailMessage`, `InstagramDm`, `LinkedinDm`, `ChatWidget`, `ChannelTabs`, `Calendar`, `DriveFolder`, `CrmCard`, `Transcript`, `ProposalDocument`, `Checklist`, `Composer`, slot and starter chips. Details below |
| `brand/` | `BrandProvider` and `useBrand` (details below), `BrandMark`, `FictionalBadge`, `MakeItYours`, `requestBrandProfile`, and `brand-link` (`shareLink`, `pathWithBrand`) |
| `shell/` | `DemoShell` (Film or Live switch, "Make it yours", footer), `PageTitle` (details below), `useRecordMode` (`?record=1`), `FallbackNote` (`?fallback=limit`), `ProviderNote` |
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

### Focus films

Every film renders through `FocusStage` (`film/focus-stage`): one focus per beat.
The inbox film is the reference: `apps/inbox/film/inbox-film.ts`, `apps/inbox/film/film-beats.ts` and `apps/inbox/ui/film-panels.tsx`.

The rules the engine holds a film to:

1. At most two panels: the beat's `focus`, large and centred, and an optional `partner` beside it. Every party is a chip in one row under the panels; the on-screen ones read as current, and a party a beat `touches` off screen gets a dot until it is on screen again.
2. One caption per beat, at most 9 words (`MAX_CAPTION_WORDS`; aim for 8), no em or en dash, shown above the panels. One `highlight` id per beat: the element the caption is about gets a brand ring.
3. At most 8 beats (`MAX_BEATS`; aim for 5 to 7), the first at 0 ms, all before the end card.
4. One transition per beat. A new focus fades through the background (`FADE_OUT` 180 ms, then `FADE_IN` 300 ms after 150 ms). A partner joining a focus that stays slides in from the right (40 px, `PANEL_TRANSITION` 350 ms ease-out) while the focus glides aside. A panel that stays fades its content through to the new beat's. The highlight ring fades in 380 ms after the beat starts, colour only. Reduced motion drops the slide and the glide; a seek or restart (`film.jumps`) shows the new picture at once. There are no travelling items.
5. Phones (below 768 px) show the focus panel only, the caption above it and the chips as a row that scrolls sideways. Put the highlight in the focus panel.
6. Nothing under 16 px at the 1280x720 recording layout. `Badge` and `StatusBadge` take `size="lg"` (17 px), `FictionalBadge` too.

`defineFocusFilm` throws on a broken script: unknown party, partner equal to focus, too many words or beats, a dash in a caption, no beat at 0.

| Module | Holds |
| --- | --- |
| `film/focus-script` | `FilmParty`, `FocusBeat<TData>`, `FocusFilmScript<TData>`, `PanelRole`, `defineFocusFilm`, `activeBeat(script, t)`, `partiesOnScreen(beat)`, `partyHistory(script, party, t)`, `partiesWithNews(script, t)`, `clockForBeats(stops, { durationMs, endTime, raceMs })`, `MAX_CAPTION_WORDS`, `MAX_BEATS` |
| `film/focus-stage` | `FocusStage` and `PanelContext<TData>` |
| `film/film-highlight` | `highlightProps(ctx, id)`: spread on the element with that id; it gets `data-film-highlight` and, in its beat, `data-highlighted`, which `styles.css` rings |
| `film/focus-panel` | `FocusPanel` (the frame: icon tile, label, role, body) and the transition constants. The stage draws it; a film does not |
| `film/party-chips`, `film/beat-caption` | The chip row and the caption. The stage draws them |
| `film/film-script` | Shared with the lane films below: `FilmClockKeyframe`, `FilmEnd`, `storyTimeAt`, `storyRateAt`, `parseStoryTime` |
| `film/use-film`, `film/film-playback` | Playback. `?t=<ms>` opens paused at that moment |
| `film/end-card`, `film/film-clock`, `film/film-controls` | The end card, the story clock (`raceHint={false}` in a focus film) and the controls |

Types:

```ts
type FilmParty = {
  id: string;
  label: string; // "Ana Ruiz", "Calendar", the owner's name
  role: string; // the line under the label: "Email", "Bookings", "Owner"
  icon?: IconName;
  accent?: string; // icon tile colour, for example "var(--channel-email)"
  brand?: boolean; // icon tile in the brand colour
};

type FocusBeat<TData> = {
  id: string;
  at: number; // film ms; the first beat is at 0
  focus: string; // party id
  partner?: string; // party id
  caption: string;
  highlight?: string; // element id inside the focus panel
  touches?: string[]; // off-screen parties that changed: their chips get a dot
  data: TData; // whatever the panels need, for example the beat's story time
};

type FocusFilmScript<TData> = {
  id: string; title: string; durationMs: number;
  parties: FilmParty[]; // chip order
  clock: FilmClockKeyframe[]; // clockForBeats builds it from the beats
  beats: FocusBeat<TData>[];
  end: FilmEnd;
};

type PanelContext<TData> = {
  party: FilmParty;
  role: "focus" | "partner";
  beat: FocusBeat<TData>; // the beat on screen
  history: FocusBeat<TData>[]; // beats that showed or touched this party, oldest first
  highlight: string | undefined;
  t: number; storyTime: number; reducedMotion: boolean;
};
```

`FocusStage` props: `script`, `renderPanel(ctx)` (returns the panel body; the stage draws frame, header and transitions), `brand` and `badge` (left of and after the title; the inbox passes the brand mark and `FictionalBadge size="lg"` only under `?record=1`, where the shell header is hidden), `actions`, `liveHref` (default `/live`), `autoplay`, `className`.

A film in three steps:

```tsx
// film/my-film.ts
const stops = [
  { at: 0, time: "2026-11-10T09:00:00", focus: "client", caption: "Maya sends four of six documents.", highlight: "upload" },
  { at: 8000, time: "2026-11-10T09:00:40", focus: "checklist", partner: "client", caption: "Two are missing. The checklist says which.", highlight: "missing" },
];
export const myFilm = defineFocusFilm<{ story: string }>({
  id: "documents", title: "One tax return, six documents", durationMs: 40_000,
  parties: [
    { id: "client", label: "Maya Fischer", role: "Client", icon: "user" },
    { id: "checklist", label: "Checklist", role: "Ledgerwick", icon: "check", brand: true },
  ],
  clock: clockForBeats(stops, { durationMs: 40_000, endTime: "2026-11-10T09:05:00" }),
  beats: stops.map(({ time, ...beat }) => ({ ...beat, id: `beat-${beat.at}`, data: { story: time } })),
  end: { at: 30_000, metric: "Chasing time", before: "12 hours", after: "1 hour" },
});

// ui/my-film.tsx
<FocusStage
  script={myFilm}
  renderPanel={(ctx) => <MyPanel ctx={ctx} />}
  liveHref={hrefWithBrand("/live")}
/>

// ui/my-panel.tsx: draw from the beat's story moment, so a beat's picture holds still
function MyPanel({ ctx }: { ctx: PanelContext<{ story: string }> }) {
  const frame = frameAt(ctx.beat.data.story);
  return <ul {...highlightProps(ctx, "missing")}>{/* large rows, 18 to 20 px text */}</ul>;
}
```

### Lane films (until documents and meetings move to the focus engine)

The documents and meetings films still render through the lane engine: `FilmStage` with `layout` and `renderLane`, `LaneContext`, `defineFilmScript` and the lane and travel types in `film-script`, `film-layout`, `LaneFeed`, `CaptionBar`, `TravelLayer`, `TravelToken` and `useLaneAnchors`.
Once both films run on `FocusStage`, those modules go, and `film-script` keeps only the clock, end card and time helpers.
`Lane` and `LaneTabs` stay: documents live mode uses them.

- The stage title is an h2 under `DemoShell`, whose title is the page's h1, and an h1 on a page without the shell. `PageTitle` from `shell/page-title` picks the level for any component title. This holds for both engines.
- Lane: `label` wraps to two lines; `tabLabel` (optional) is the short name on the phone tabs, which otherwise show `role`. Set it when the role is long, for example "Firm" for "Tax and accounting firm".
- Reduced motion comes from `usePrefersReducedMotion` in `film/use-stage-environment`: false on the server and the first client render, so hydration matches, then the real value. `LaneContext.reducedMotion` and `PanelContext.reducedMotion` carry it. Do not read motion's `useReducedMotion` for markup.
- `EndCard` covers the panels or lanes and the caption and sizes its text to the height it gets, so it fits a 1280x720 recording. Props: `end`, `visible`, `onReplay`, `liveHref`, `recording` (shows "Made by diepen.ai" instead of Replay and "Try it live"), `reducedMotion`. On phones it is an opaque full-screen cover.
- `CaptionBar` always reserves two lines (three on phones) and takes `jumpKey`: when it changes (the stage passes `film.jumps`, which counts seeks and restarts) the new caption replaces the old one without a crossfade.
- `useFilm` keys: Space, R and the arrows work wherever focus is, also on a film button, except in a text field or a dialog. The controller also returns `jumps`.
- Travel items show their full label on up to two lines and fly without a trail line.
- The scrubber announces "0:13 of 1:26". On phones every film control, the shell buttons, the Film and Live switch and the "Make it yours" fields are at least 44 px tall.

### Mockups

- Slot chips that can be picked are 44 px tall on phones. They take `disabled`: unpicked times turn grey and are not buttons, and the list carries `data-disabled`. Every conversation mockup sets it while `handover` is set, so after a handover no app has to dim or unhook the chips itself.
- `Composer`: on phones (below 640 px) every field and button is at least 44 px tall. The email composer is compact there: two lines and a round Send button beside them, without the attachment and shortcut row, so the thread keeps its room.
- `DriveFolder` shows the parent folders as a small muted line that wraps and the open folder on its own line under it, and counts "1 file" in the singular. With `wrapNames`, a file name breaks only after `_` (a `<wbr>`) or `-`, never inside a word.
