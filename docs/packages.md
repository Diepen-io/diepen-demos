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
| `brand-extraction` | The use case `extractBrandProfile({ url, fetchPage, provider })` |
| `brand-route` | `createBrandHandler({ fetchPage, provider?, guards? })` and the default `handleBrandRequest` |
| `page-fetcher` | The `PageFetcher` port and its adapter: public addresses only, checked on every redirect, size and time caps |
| `html-signals` | Title, meta, colours, icons and visible text from one page, in linear time |
| `profile-codec` | Browser-safe `encodeProfile` and `decodeProfile` for the `?brand=` parameter |
| `color-contrast` | `readableForeground`, `contrastRatio` |

## @diepen/ui

The design system. It never imports `@diepen/ai`.

| Folder | Holds |
| --- | --- |
| `film/` | `defineFilmScript` and the script types, `useFilm`, `FilmStage` (with `layout`, `renderLane`, `brand`, `actions`, `liveHref`), `LaneFeed`, `EndCard`, `FilmClock`, `CaptionBar`, `FilmControls`. `?t=<ms>` opens paused at that moment |
| `mockups/` | `EmailInbox`, `EmailMessage`, `InstagramDm`, `LinkedinDm`, `ChatWidget`, `ChannelTabs`, `Calendar`, `DriveFolder`, `CrmCard`, `Transcript`, `ProposalDocument`, `Checklist`, `Composer`, slot and starter chips |
| `brand/` | `BrandProvider` and `useBrand` (`?brand=`, then local storage, then the preset), `BrandMark`, `FictionalBadge`, `MakeItYours`, `requestBrandProfile` |
| `shell/` | `DemoShell` (Film or Live switch, "Make it yours", footer), `useRecordMode` (`?record=1`), `FallbackNote` (`?fallback=limit`), `ProviderNote` |
| `primitives/` | `Button`, `Input`, `Textarea`, `Field`, `Badge`, `StatusBadge`, `Avatar`, `Icon`, `Sheet`, `Segmented`, `cx` |
