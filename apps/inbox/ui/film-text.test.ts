import { defaultPresetFor } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { fillTemplate } from "@/domain/message-template";
import { filmMessages } from "@/film/fixtures";
import { filmText } from "./film-text";

const profile = defaultPresetFor("inbox");
const shown = (id: string) => filmText(fillTemplate(filmMessages.find((message) => message.id === id)?.text ?? "", profile), profile);

describe("filmText", () => {
  it("drops an email's greeting and sign-off and keeps the body", () => {
    expect(shown("C1-1")).toMatch(/^I just moved to the area\./);
    expect(shown("C1-1")).not.toMatch(/Thanks|Hi there/);
    expect(shown("C1-2")).not.toContain(profile.voice.signOff);
    expect(shown("C1-2")).toMatch(/^Welcome to the area/);
  });

  it("drops the assistant's name line under a message", () => {
    expect(shown("C3-2")).not.toMatch(new RegExp(`${profile.people.assistantName}$`));
  });

  it("keeps a chat message whole", () => {
    expect(shown("C2-1")).toBe(fillTemplate("hi! do you do {serviceB}? how much is it", profile));
  });
});
