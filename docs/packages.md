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
| `film/` | `defineFilmScript` and the script types, `useFilm`, `FilmStage` (with `layout`, `renderLane`, `brand`, `actions`, `liveHref`), `LaneFeed`, `EndCard`, `FilmClock`, `CaptionBar`, `FilmControls`. `?t=<ms>` opens paused at that moment. Details below |
| `mockups/` | `EmailInbox`, `EmailMessage`, `InstagramDm`, `LinkedinDm`, `ChatWidget`, `ChannelTabs`, `Calendar`, `DriveFolder`, `CrmCard`, `Transcript`, `ProposalDocument`, `Checklist`, `Composer`, slot and starter chips |
| `brand/` | `BrandProvider` and `useBrand` (details below), `BrandMark`, `FictionalBadge`, `MakeItYours`, `requestBrandProfile`, and `brand-link` (`shareLink`, `pathWithBrand`) |
| `shell/` | `DemoShell` (Film or Live switch, "Make it yours", footer), `PageTitle` (details below), `useRecordMode` (`?record=1`), `FallbackNote` (`?fallback=limit`), `ProviderNote` |
| `primitives/` | `Button`, `Input`, `Textarea`, `Field`, `Badge`, `StatusBadge`, `Avatar`, `Icon`, `Sheet`, `Segmented`, `cx` |

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

### Film stage

- The stage title is an h2 under `DemoShell`, whose title is the page's h1, and an h1 on a page without the shell. `PageTitle` from `shell/page-title` picks the level for any component title.
- Lane: `label` wraps to two lines; `tabLabel` (optional) is the short name on the phone tabs, which otherwise show `role`. Set it when the role is long, for example "Firm" for "Tax and accounting firm".
- Reduced motion comes from `usePrefersReducedMotion` in `film/use-stage-environment`: false on the server and the first client render, so hydration matches, then the real value. `LaneContext.reducedMotion` carries it to `renderLane`. Do not read motion's `useReducedMotion` for markup.
- `EndCard` covers the lanes and the caption and sizes its text to the height it gets, so it fits a 1280x720 recording. Props: `end`, `visible`, `onReplay`, `liveHref`, `recording` (shows "Made by diepen.ai" instead of Replay and "Try it live"), `reducedMotion`. On phones it is an opaque full-screen cover.
- `CaptionBar` always reserves two lines (three on phones) and takes `jumpKey`: when it changes (the stage passes `film.jumps`, which counts seeks and restarts) the new caption replaces the old one without a crossfade.
- `useFilm` keys: Space, R and the arrows work wherever focus is, also on a film button, except in a text field or a dialog. The controller also returns `jumps`.
- Travel items show their full label on up to two lines and fly without a trail line.
- The scrubber announces "0:13 of 1:26". On phones every film control, the shell buttons, the Film and Live switch and the "Make it yours" fields are at least 44 px tall.

