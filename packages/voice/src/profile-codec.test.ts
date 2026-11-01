import { describe, expect, it } from "vitest";
import { presets } from "./presets.ts";
import { decodeProfile, encodeProfile } from "./profile-codec.ts";

describe("profile codec", () => {
  it("round-trips a profile through a URL-safe string", () => {
    const encoded = encodeProfile(presets["ledgerwick-accounting"]);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeProfile(encoded)).toEqual(presets["ledgerwick-accounting"]);
  });

  it("keeps non-Latin text intact", () => {
    const profile = { ...presets["ottervale-dental"], name: "Zahnärztin Müller 歯科 🦷" };
    expect(decodeProfile(encodeProfile(profile))?.name).toBe("Zahnärztin Müller 歯科 🦷");
  });

  it("survives being put in a URL parameter", () => {
    const url = new URL("https://demo.example/live");
    url.searchParams.set("brand", encodeProfile(presets["brickfern-property"]));
    expect(decodeProfile(new URL(url.href).searchParams.get("brand"))).toEqual(presets["brickfern-property"]);
  });

  it("returns null for empty, broken or invalid values", () => {
    expect(decodeProfile(null)).toBeNull();
    expect(decodeProfile("")).toBeNull();
    expect(decodeProfile("not base64 at all!")).toBeNull();
    const notAProfile = btoa(JSON.stringify({ name: "x" })).replace(/=+$/, "");
    expect(decodeProfile(notAProfile)).toBeNull();
  });
});
