import { describe, expect, it } from "vitest";
import { presets } from "./presets.ts";
import { decodeProfile, encodeProfile } from "./profile-codec.ts";

const custom = { ...presets["ottervale-dental"], id: "harbour-bakery", name: "Harbour Bakery", fictional: false };

describe("profile codec", () => {
  it("encodes an unchanged preset as its short id and decodes the id to that preset", () => {
    expect(encodeProfile(presets["ledgerwick-accounting"])).toBe("ledgerwick-accounting");
    expect(decodeProfile("ottervale-dental")).toBe(presets["ottervale-dental"]);
  });

  it("knows a preset after a round trip through JSON, whatever the key order", () => {
    const copy = JSON.parse(JSON.stringify(presets["brickfern-property"])) as Record<string, unknown>;
    const reordered = Object.fromEntries(Object.entries(copy).reverse()) as typeof custom;
    expect(encodeProfile(reordered)).toBe("brickfern-property");
  });

  it("encodes an edited preset as base64url JSON, not as the preset id", () => {
    const edited = { ...presets["ottervale-dental"], tagline: "Something else" };
    const encoded = encodeProfile(edited);
    expect(encoded).not.toBe("ottervale-dental");
    expect(decodeProfile(encoded)).toEqual(edited);
  });

  it("round-trips a custom profile through a URL-safe string", () => {
    const encoded = encodeProfile(custom);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeProfile(encoded)).toEqual(custom);
  });

  it("keeps non-Latin text intact", () => {
    const profile = { ...custom, name: "Zahnärztin Müller 歯科 🦷" };
    expect(decodeProfile(encodeProfile(profile))?.name).toBe("Zahnärztin Müller 歯科 🦷");
  });

  it("survives being put in a URL parameter", () => {
    const url = new URL("https://demo.example/live");
    url.searchParams.set("brand", encodeProfile(custom));
    expect(decodeProfile(new URL(url.href).searchParams.get("brand"))).toEqual(custom);
  });

  it("returns null for empty, broken or invalid values", () => {
    expect(decodeProfile(null)).toBeNull();
    expect(decodeProfile("")).toBeNull();
    expect(decodeProfile("not base64 at all!")).toBeNull();
    expect(decodeProfile("toString")).toBeNull();
    const notAProfile = btoa(JSON.stringify({ name: "x" })).replace(/=+$/, "");
    expect(decodeProfile(notAProfile)).toBeNull();
  });
});
