import type { CompanyProfile } from "@diepen/voice/profile";
import { presets } from "@diepen/voice/presets";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { navigateTo } from "./brand-link";
import { BrandProvider, useBrand } from "./brand-provider";
import { brandStorageKey } from "./profile-store";

vi.mock("./brand-link", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./brand-link")>()),
  navigateTo: vi.fn(),
}));

const film = presets["ottervale-dental"];
const visitor: CompanyProfile = { ...presets["brickfern-property"], id: "harbour-bakery", name: "Harbour Bakery", fictional: false };

function Probe() {
  const { profile, savedProfile, setProfile, hrefWithBrand, shareHref } = useBrand();
  return (
    <>
      <p data-testid="shown">{profile.name}</p>
      <p data-testid="saved">{savedProfile.name}</p>
      <a href={hrefWithBrand("/live")}>live</a>
      <p data-testid="share">{shareHref()}</p>
      <button onClick={() => setProfile(presets["ledgerwick-accounting"])}>apply</button>
    </>
  );
}

function tree(props: { fixed?: boolean; brandParamValue?: string }) {
  return (
    <BrandProvider defaultProfile={film} {...props}>
      <Probe />
    </BrandProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.mocked(navigateTo).mockClear();
});
afterEach(cleanup);

describe("BrandProvider in fixed mode", () => {
  it("shows its own company whatever the URL and storage hold, and keeps the visitor's for links", () => {
    window.localStorage.setItem(brandStorageKey, encodeProfile(visitor));
    window.history.replaceState(null, "", "/?t=8000");
    render(tree({ fixed: true }));
    expect(screen.getByTestId("shown").textContent).toBe(film.name);
    expect(screen.getByTestId("saved").textContent).toBe(visitor.name);
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/live?brand=${encodeProfile(visitor)}`);
    expect(screen.getByTestId("share").textContent).toBe(`http://localhost:3000/live?brand=${encodeProfile(visitor)}`);
    expect(document.querySelector<HTMLElement>("[data-brand-scope]")?.style.getPropertyValue("--brand")).toBe(film.colors.brand);
  });

  it("saves an applied profile and opens live mode with it", () => {
    render(tree({ fixed: true }));
    act(() => screen.getByText("apply").click());
    expect(screen.getByTestId("shown").textContent).toBe(film.name);
    expect(window.localStorage.getItem(brandStorageKey)).toBe("ledgerwick-accounting");
    expect(navigateTo).toHaveBeenCalledWith("/live?brand=ledgerwick-accounting");
  });
});

describe("BrandProvider links and first paint", () => {
  it("shares the profile loaded from storage, without the viewing parameters", () => {
    window.localStorage.setItem(brandStorageKey, encodeProfile(visitor));
    window.history.replaceState(null, "", "/live?t=4000&record=1&fallback=limit");
    render(tree({}));
    expect(screen.getByTestId("share").textContent).toBe(`http://localhost:3000/live?brand=${encodeProfile(visitor)}`);
  });

  it("renders a shared preset id and a shared custom profile on the server", () => {
    expect(renderToString(tree({ brandParamValue: "brickfern-property" }))).toContain(presets["brickfern-property"].name);
    expect(renderToString(tree({ brandParamValue: encodeProfile(visitor) }))).toContain(visitor.name);
    expect(renderToString(tree({ fixed: true, brandParamValue: encodeProfile(visitor) }))).toContain(`>${film.name}<`);
  });
});
