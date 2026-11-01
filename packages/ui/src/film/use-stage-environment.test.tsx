import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./use-stage-environment";

function Probe() {
  return usePrefersReducedMotion() ? <p>still</p> : <svg aria-label="moving" />;
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("usePrefersReducedMotion", () => {
  it("hydrates server HTML without a mismatch, then switches to reduced motion", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Probe />);
    stubReducedMotion(true);
    const onRecoverableError = vi.fn();

    act(() => {
      hydrateRoot(container, <Probe />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe("still");
  });
});
