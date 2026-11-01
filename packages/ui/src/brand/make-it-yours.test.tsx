import type { CompanyProfile } from "@diepen/voice/profile";
import { presetList } from "@diepen/voice/presets";
import { encodeProfile } from "@diepen/voice/profile-codec";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrandProvider, useBrand } from "./brand-provider";
import { MakeItYours } from "./make-it-yours";
import { brandStorageKey } from "./profile-store";

const [defaultProfile, other] = presetList as [CompanyProfile, CompanyProfile];
const extracted = { ...other, id: "harbour-bakery", name: "Harbour Bakery", fictional: false };

function ActiveName() {
  return <p data-testid="active">{useBrand().profile.name}</p>;
}

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <BrandProvider defaultProfile={defaultProfile}>
      <ActiveName />
      <MakeItYours open={open} onClose={() => setOpen(false)} />
    </BrandProvider>
  );
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function submitWebsite(value: string) {
  fireEvent.change(screen.getByLabelText("Your website"), { target: { value } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Read my site" }));
    await Promise.resolve();
  });
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("MakeItYours", () => {
  it("posts the website, loads the draft into the form and applies it", async () => {
    const fetchMock = mockFetch(200, { profile: extracted, provider: "claude" });
    render(<Harness />);
    await submitWebsite("harbour-bakery.de");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/brand",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ url: "https://harbour-bakery.de/" }) }),
    );
    await screen.findByText("Draft ready from harbour-bakery.de. Check it below, then apply.");
    expect(screen.getByLabelText<HTMLInputElement>("Name").value).toBe("Harbour Bakery");
    expect(screen.queryByText("Demo answers. No API key is set.")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByTestId("active").textContent).toBe("Harbour Bakery");
    expect(new URLSearchParams(window.location.search).get("brand")).toBeTruthy();
  });

  it("says when the mock provider wrote the draft", async () => {
    mockFetch(200, { profile: extracted, provider: "mock" });
    render(<Harness />);
    await submitWebsite("harbour-bakery.de");
    await screen.findByText("Demo answers. No API key is set.");
  });

  it("shows the server's message on an error", async () => {
    mockFetch(422, { message: "That page has no readable text." });
    render(<Harness />);
    await submitWebsite("https://example.com");
    await screen.findByText("That page has no readable text.");
    expect(screen.getByTestId("active").textContent).toBe(defaultProfile.name);
  });

  it("asks for a real address before it calls the server", async () => {
    const fetchMock = mockFetch(200, {});
    render(<Harness />);
    await submitWebsite("not a site");
    await screen.findByText("Enter a website address like yourcompany.com.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses to apply an incomplete profile", async () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/name/i));
    expect(screen.getByTestId("active").textContent).toBe(defaultProfile.name);
  });

  it("copies a link that carries the profile loaded from storage, without film time", async () => {
    window.localStorage.setItem(brandStorageKey, encodeProfile(extracted));
    window.history.replaceState(null, "", "/live?t=4000&record=1");
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalledWith(`http://localhost:3000/live?brand=${encodeProfile(extracted)}`);
  });

  it("edits the owner's name and role and the sign-off", () => {
    render(<Harness />);
    expect(screen.getByLabelText<HTMLInputElement>("Owner's name").value).toBe(defaultProfile.people.owner.name);
    expect(screen.getByLabelText<HTMLInputElement>("Owner's role").value).toBe(defaultProfile.people.owner.role);
    fireEvent.change(screen.getByLabelText("Sign-off"), { target: { value: "Cheers,\nAda" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(new URLSearchParams(window.location.search).get("brand")).not.toBe(defaultProfile.id);
  });

  it("gives every field an id or a name", () => {
    render(<Harness />);
    const fields = [...document.querySelectorAll("input, textarea, select")];
    expect(fields.length).toBeGreaterThan(10);
    expect(fields.filter((field) => !field.id && !field.getAttribute("name"))).toEqual([]);
  });

  it("offers only the example companies the demo passes (decision F3)", () => {
    render(
      <BrandProvider defaultProfile={defaultProfile}>
        <MakeItYours open onClose={() => undefined} presets={[defaultProfile]} />
      </BrandProvider>,
    );
    expect(screen.getByRole("heading", { name: "Example company" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: new RegExp(other.name) })).toBeNull();
  });
});
