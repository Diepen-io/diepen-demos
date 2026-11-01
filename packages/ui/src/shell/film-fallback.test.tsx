import { describe, expect, it } from "vitest";
import { filmFallbackHref } from "./film-fallback";

describe("filmFallbackHref", () => {
  it("adds fallback=limit to the film link and keeps the profile", () => {
    expect(filmFallbackHref("/")).toBe("/?fallback=limit");
    expect(filmFallbackHref("/?brand=ottervale-dental")).toBe("/?brand=ottervale-dental&fallback=limit");
  });

  it("does not add the parameter twice", () => {
    expect(filmFallbackHref("/?fallback=limit")).toBe("/?fallback=limit");
  });
});
