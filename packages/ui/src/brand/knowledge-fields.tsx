"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { Button } from "../primitives/button";
import { Field } from "../primitives/field";
import { Icon } from "../primitives/icon";
import { Input } from "../primitives/input";
import { Textarea } from "../primitives/textarea";
import { FormSection } from "./form-section";

type Knowledge = CompanyProfile["knowledge"];

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="press inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-faint hover:bg-subtle hover:text-fail max-sm:size-11"
    >
      <Icon name="close" size={16} />
    </button>
  );
}

const replaceAt = <T,>(items: T[], index: number, item: T) => items.map((old, i) => (i === index ? item : old));
const removeAt = <T,>(items: T[], index: number) => items.filter((_, i) => i !== index);

export function KnowledgeFields({ value, onChange }: { value: Knowledge; onChange: (value: Knowledge) => void }) {
  const { services, faq } = value;
  return (
    <>
      <FormSection title="Services and prices">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl bg-subtle p-3">
            {/* Grid tracks, not flex widths: every Input carries w-full, which beat a fixed price width. */}
            <div className="grid grid-cols-[minmax(0,1fr)_6rem_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
              <Input
                name={`services.${index}.name`}
                aria-label={`Service ${index + 1} name`}
                placeholder="Service"
                value={service.name}
                onChange={(event) => onChange({ ...value, services: replaceAt(services, index, { ...service, name: event.target.value }) })}
              />
              <Input
                name={`services.${index}.price`}
                aria-label={`Service ${index + 1} price`}
                placeholder="Price"
                value={service.price ?? ""}
                className="tabular"
                onChange={(event) =>
                  onChange({ ...value, services: replaceAt(services, index, { ...service, price: event.target.value || undefined }) })
                }
              />
              <RemoveButton label={`Remove ${service.name || "service"}`} onClick={() => onChange({ ...value, services: removeAt(services, index) })} />
            </div>
            <Input
              name={`services.${index}.description`}
              aria-label={`Service ${index + 1} description`}
              placeholder="What it includes"
              value={service.description}
              onChange={(event) =>
                onChange({ ...value, services: replaceAt(services, index, { ...service, description: event.target.value }) })
              }
            />
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onChange({ ...value, services: [...services, { name: "", description: "" }] })}
        >
          <Icon name="plus" size={14} /> Add a service
        </Button>
      </FormSection>

      <FormSection title="Opening hours">
        <Field label="Opening hours" hint="For example Mon to Fri 8:00 to 18:00">
          {(control) => <Input {...control} value={value.openingHours} onChange={(event) => onChange({ ...value, openingHours: event.target.value })} />}
        </Field>
      </FormSection>

      <FormSection title="FAQ">
        {faq.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl bg-subtle p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Input
                name={`faq.${index}.question`}
                aria-label={`Question ${index + 1}`}
                placeholder="Question"
                value={item.question}
                onChange={(event) => onChange({ ...value, faq: replaceAt(faq, index, { ...item, question: event.target.value }) })}
              />
              <RemoveButton label={`Remove question ${index + 1}`} onClick={() => onChange({ ...value, faq: removeAt(faq, index) })} />
            </div>
            <Textarea
              name={`faq.${index}.answer`}
              aria-label={`Answer ${index + 1}`}
              placeholder="Answer"
              rows={2}
              value={item.answer}
              onChange={(event) => onChange({ ...value, faq: replaceAt(faq, index, { ...item, answer: event.target.value }) })}
            />
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onChange({ ...value, faq: [...faq, { question: "", answer: "" }] })}
        >
          <Icon name="plus" size={14} /> Add a question
        </Button>
      </FormSection>
    </>
  );
}
