import type { CompanyProfile } from "@diepen/voice/profile";
import { presetList } from "@diepen/voice/presets";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BrandProvider, useBrand } from "./brand-provider";
import { brandStorageKey } from "./profile-store";

const [defaultProfile, other] = presetList as [CompanyProfile, CompanyProfile];
const custom = { ...other, id: "custom", name: "Harbour Bakery", fictional: false, colors: { brand: "#9a3412", brandForeground: "#ffffff" } };

function Probe() {
  const { profile, setProfile, resetProfile } = useBrand();
  return (
    <>
      <p data-testid="name">{profile.name}</p>
      <button onClick={() => setProfile(custom)}>apply</button>
      <button onClick={resetProfile}>reset</button>
    </>
  );
}

function renderProvider() {
  render(
    <BrandProvider defaultProfile={defaultProfile} className="scope">
      <Probe />
    </BrandProvider>,
  );
  return screen.getByTestId("name");
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(cleanup);

describe("BrandProvider", () => {
  it("uses the app's default preset when the URL and storage are empty", () => {
    expect(renderProvider().textContent).toBe(defaultProfile.name);
  });

  it("prefers local storage over the default", () => {
    window.localStorage.setItem(brandStorageKey, encodeProfile(other));
    expect(renderProvider().textContent).toBe(other.name);
  });

  it("prefers the ?brand= parameter over local storage", () => {
    window.localStorage.setItem(brandStorageKey, encodeProfile(other));
    window.history.replaceState(null, "", `/?brand=${encodeProfile(custom)}`);
    expect(renderProvider().textContent).toBe(custom.name);
  });

  it("ignores a broken ?brand= value and falls back to storage", () => {
    window.localStorage.setItem(brandStorageKey, encodeProfile(other));
    window.history.replaceState(null, "", "/?brand=not-a-profile");
    expect(renderProvider().textContent).toBe(other.name);
  });

  it("sets --brand and --brand-foreground on its wrapper", () => {
    renderProvider();
    const scope = document.querySelector<HTMLElement>("[data-brand-scope]");
    expect(scope?.style.getPropertyValue("--brand")).toBe(defaultProfile.colors.brand);
    expect(scope?.style.getPropertyValue("--brand-foreground")).toBe(defaultProfile.colors.brandForeground);
  });

  it("writes storage and the URL on setProfile, and clears both on reset", () => {
    const name = renderProvider();
    act(() => screen.getByText("apply").click());
    expect(name.textContent).toBe(custom.name);
    expect(window.localStorage.getItem(brandStorageKey)).toBe(encodeProfile(custom));
    expect(new URLSearchParams(window.location.search).get("brand")).toBe(encodeProfile(custom));
    expect(document.querySelector<HTMLElement>("[data-brand-scope]")?.style.getPropertyValue("--brand")).toBe("#9a3412");

    act(() => screen.getByText("reset").click());
    expect(name.textContent).toBe(defaultProfile.name);
    expect(window.localStorage.getItem(brandStorageKey)).toBeNull();
    expect(window.location.search).toBe("");
  });

  it("still renders when local storage throws", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    try {
      const name = renderProvider();
      expect(name.textContent).toBe(defaultProfile.name);
      act(() => screen.getByText("apply").click());
      expect(name.textContent).toBe(custom.name);
    } finally {
      if (original) Object.defineProperty(window, "localStorage", original);
    }
  });
});
