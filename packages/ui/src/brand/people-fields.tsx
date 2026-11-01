"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { Field } from "../primitives/field";
import { Input } from "../primitives/input";
import { FormSection } from "./form-section";

type People = CompanyProfile["people"];

/** Who the demo speaks for: the owner who gets handovers and signs follow-ups, and the assistant's name. */
export function PeopleFields({ value, onChange }: { value: People; onChange: (value: People) => void }) {
  const setOwner = (owner: Partial<People["owner"]>) => onChange({ ...value, owner: { ...value.owner, ...owner } });
  return (
    <FormSection title="People">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Owner's name" hint="For example Lena Okafor, or the team">
          {(control) => (
            <Input {...control} name="people.owner.name" autoComplete="off" value={value.owner.name} onChange={(event) => setOwner({ name: event.target.value })} />
          )}
        </Field>
        <Field label="Owner's role" hint="For example Practice owner">
          {(control) => (
            <Input {...control} name="people.owner.role" autoComplete="off" value={value.owner.role} onChange={(event) => setOwner({ role: event.target.value })} />
          )}
        </Field>
      </div>
      <Field label="Assistant signs as" hint="For example Mia from Northlight">
        {(control) => (
          <Input
            {...control}
            name="people.assistantName"
            autoComplete="off"
            value={value.assistantName}
            onChange={(event) => onChange({ ...value, assistantName: event.target.value })}
          />
        )}
      </Field>
    </FormSection>
  );
}
