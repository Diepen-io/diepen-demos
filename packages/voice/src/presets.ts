import type { CompanyProfile } from "./profile.ts";
import { brickfernProperty } from "./presets/brickfern-property.ts";
import { ledgerwickAccounting } from "./presets/ledgerwick-accounting.ts";
import { ottervaleDental } from "./presets/ottervale-dental.ts";

/** The three fictional companies the demos ship with. Each has `fictional: true`. */
export const presets = {
  "ottervale-dental": ottervaleDental,
  "brickfern-property": brickfernProperty,
  "ledgerwick-accounting": ledgerwickAccounting,
} as const satisfies Record<string, CompanyProfile>;

export type PresetId = keyof typeof presets;

export const presetList: readonly CompanyProfile[] = Object.values(presets);

export type DemoName = "inbox" | "documents" | "meetings";

const presetByDemo: Record<DemoName, PresetId> = {
  inbox: "ottervale-dental",
  documents: "ledgerwick-accounting",
  meetings: "brickfern-property",
};

/** The company each demo opens with before a visitor makes it their own. */
export function defaultPresetFor(demo: DemoName): CompanyProfile {
  return presets[presetByDemo[demo]];
}
