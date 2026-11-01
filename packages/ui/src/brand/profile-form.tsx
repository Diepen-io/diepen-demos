"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { initials } from "../primitives/avatar";
import { Field } from "../primitives/field";
import { Input } from "../primitives/input";
import { Textarea } from "../primitives/textarea";
import { ColorsField } from "./colors-field";
import { FormSection } from "./form-section";
import { KnowledgeFields } from "./knowledge-fields";
import { ListField } from "./list-field";

export type ProfileFormProps = {
  draft: CompanyProfile;
  onChange: (draft: CompanyProfile) => void;
};

/** Every part of the profile a prospect would want to correct before the demo runs in their name. */
export function ProfileForm({ draft, onChange }: ProfileFormProps) {
  const set = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) => onChange({ ...draft, [key]: value });
  const logoUrl = draft.logo.kind === "url" ? draft.logo.url : "";

  return (
    <div className="flex flex-col gap-6">
      <FormSection title="Company">
        <Field label="Name">
          {(control) => (
            <Input
              {...control}
              value={draft.name}
              onChange={(event) => {
                const name = event.target.value;
                const logo = draft.logo.kind === "monogram" ? { kind: "monogram" as const, text: initials(name).slice(0, 3) } : draft.logo;
                onChange({ ...draft, name, logo });
              }}
            />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Industry">
            {(control) => <Input {...control} value={draft.industry} onChange={(event) => set("industry", event.target.value)} />}
          </Field>
          <Field label="Assistant signs as" hint="For example Mia from Northlight">
            {(control) => (
              <Input
                {...control}
                value={draft.people.assistantName}
                onChange={(event) => set("people", { ...draft.people, assistantName: event.target.value })}
              />
            )}
          </Field>
        </div>
        <Field label="Logo URL" hint="Leave empty to use your initials">
          {(control) => (
            <Input
              {...control}
              type="url"
              inputMode="url"
              value={logoUrl}
              placeholder="https://yourcompany.com/logo.png"
              onChange={(event) => {
                const url = event.target.value.trim();
                set("logo", url ? { kind: "url", url } : { kind: "monogram", text: initials(draft.name).slice(0, 3) });
              }}
            />
          )}
        </Field>
      </FormSection>

      <FormSection title="Colours">
        <ColorsField value={draft.colors} onChange={(colors) => set("colors", colors)} />
      </FormSection>

      <FormSection title="Voice">
        <Field label="Tone" hint="How replies should sound">
          {(control) => (
            <Textarea {...control} rows={2} value={draft.voice.tone} onChange={(event) => set("voice", { ...draft.voice, tone: event.target.value })} />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <ListField
            label="Words to use"
            separator="comma"
            value={draft.voice.wordsToUse}
            onChange={(wordsToUse) => set("voice", { ...draft.voice, wordsToUse })}
          />
          <ListField
            label="Words to avoid"
            separator="comma"
            value={draft.voice.wordsToAvoid}
            onChange={(wordsToAvoid) => set("voice", { ...draft.voice, wordsToAvoid })}
          />
        </div>
      </FormSection>

      <FormSection title="Policies">
        <ListField
          label="The assistant may promise"
          separator="line"
          value={draft.policies.mayPromise}
          onChange={(mayPromise) => set("policies", { ...draft.policies, mayPromise })}
        />
        <ListField
          label="It never promises"
          separator="line"
          value={draft.policies.neverPromise}
          onChange={(neverPromise) => set("policies", { ...draft.policies, neverPromise })}
        />
        <ListField
          label="Hand over to a person when"
          separator="line"
          value={draft.policies.handoverWhen}
          onChange={(handoverWhen) => set("policies", { ...draft.policies, handoverWhen })}
        />
        <Field label="Handover message">
          {(control) => (
            <Textarea
              {...control}
              rows={2}
              value={draft.policies.handoverMessage}
              onChange={(event) => set("policies", { ...draft.policies, handoverMessage: event.target.value })}
            />
          )}
        </Field>
      </FormSection>

      <KnowledgeFields value={draft.knowledge} onChange={(knowledge) => set("knowledge", knowledge)} />
    </div>
  );
}
