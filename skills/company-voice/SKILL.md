---
name: company-voice
description: Write a CompanyProfile JSON for a client business from its website, documents and sample emails. Use it when a client demo or a client build needs the voice, policies and knowledge of a company. Also use it when the user asks for a company profile, brand profile or voice profile. The output matches packages/voice/src/profile.ts.
---

# Company voice

The output is one JSON object that passes `companyProfileSchema` in `packages/voice/src/profile.ts`.
Every AI reply in the demos uses this object, so each field must be true for the client.

## Inputs

- The client website: the home page, the services or prices page, the contact page and the FAQ page.
- Documents from the client: price lists, terms, brochures, onboarding guides.
- Five to ten sample emails or messages that the client wrote to customers.
- Answers from the owner to the questions in step 4.

## Steps

1. Gather the sources.
   Read each source in full.
   Record the source of each fact (page URL or file name).
   Use only the client sources. Do not use search results about other companies.
2. Write the identity fields.
   - `id`: the company name in lowercase, with hyphens.
   - `name`, `industry`, `tagline`, `website`: as the client writes them.
   - `fictional`: `false`.
   - `logo`: a `url` to the logo file on the client website, or a `monogram` of one to three letters.
   - `colors.brand`: the main brand colour as a six-digit hex value.
   - `colors.brandForeground`: `#ffffff` or `#111111`. Use the colour with the higher contrast on `colors.brand`.
3. Extract the tone from real sentences.
   Copy three to five sentences from the sample emails into your notes.
   Describe the tone in two or three sentences in `voice.tone`: sentence length, formality, how the client greets.
   Put words that the client uses often in `voice.wordsToUse`.
   Put words that do not fit the tone in `voice.wordsToAvoid`.
   Copy the sign-off from a sample email into `voice.signOff`.
4. List the policies with the owner.
   Ask the owner these questions:
   - What can the assistant promise without a person?
   - What must the assistant never promise?
   - When must a person take over?
   - What does the assistant say when it hands over, and when does a person reply?
   Put the answers in `policies`.
   `policies.handoverWhen` always includes complaints, refunds, legal questions, professional advice (medical, tax, legal) and any question that the knowledge does not answer.
5. Write the knowledge.
   - `knowledge.services`: each service with a description. Copy each price exactly from a client source.
   - If no source states a price, omit `price`. Never invent, estimate or round a price.
   - `knowledge.openingHours`, `location`, `contactEmail`, `phone`: copy them from the sources.
   - `knowledge.faq`: six to eight questions that customers ask, with the answers from the sources.
   - `knowledge.bookingMinutes`: the length of one appointment. Ask the owner if no source states it.
6. Name the people.
   `people.owner` is the owner's name and role.
   `people.assistantName` is the name that the assistant signs with, for example "Mia from Ottervale".
7. Check the JSON against the schema.
   Parse the JSON with `companyProfileSchema.safeParse` from `@diepen/voice/profile`.
   Fix each error that the parse reports. Parse again until the result is `success: true`.
8. Report to the user.
   Give the JSON.
   Give a list of fields that have no client source. The owner must check these fields.

## Rules

- Do not invent a fact. If no source states a fact, leave the field empty or ask the owner.
- Do not use em dashes or en dashes in the text fields.
- Write the text fields in the language that the client uses with customers.
- To show the profile in a demo, encode it with `encodeProfile` from `@diepen/voice/profile-codec` and put the result in the `?brand=` URL parameter.
