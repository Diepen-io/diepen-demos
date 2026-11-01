import { describe, expect, it } from "vitest";
import { clientIp, createGuards } from "./guards.ts";

function requestFrom(headers: Record<string, string>) {
  return new Request("https://demo.example/api/chat", { method: "POST", headers });
}

function clock(start: string) {
  let time = Date.parse(start);
  return { now: () => time, advance: (ms: number) => (time += ms) };
}

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry", () => {
    expect(clientIp(requestFrom({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to unknown", () => {
    expect(clientIp(requestFrom({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(requestFrom({}))).toBe("unknown");
  });
});

describe("rate limit", () => {
  it("allows the limit per minute per IP, then trips, then frees up as the window slides", () => {
    const time = clock("2026-11-01T10:00:00Z");
    const guards = createGuards({ now: time.now, perMinute: 2, dailyCap: 100 });
    const visitor = requestFrom({ "x-forwarded-for": "203.0.113.7" });

    expect(guards.check(visitor)).toEqual({ ok: true });
    time.advance(30_000);
    expect(guards.check(visitor)).toEqual({ ok: true });
    expect(guards.check(visitor)).toMatchObject({ ok: false, reason: "rate_limit" });
    expect(guards.check(requestFrom({ "x-forwarded-for": "198.51.100.2" }))).toEqual({ ok: true });

    time.advance(30_001);
    expect(guards.check(visitor)).toEqual({ ok: true });
  });
});

describe("daily cap", () => {
  it("trips after the cap and resets at UTC midnight", () => {
    const time = clock("2026-11-01T23:59:00Z");
    const guards = createGuards({ now: time.now, perMinute: 100, dailyCap: 2 });
    const visitor = requestFrom({ "x-real-ip": "203.0.113.7" });

    guards.check(visitor);
    guards.check(visitor);
    const tripped = guards.check(visitor);
    expect(tripped).toMatchObject({ ok: false, reason: "daily_cap" });
    expect(tripped.ok ? "" : tripped.message).toMatch(/film/);

    time.advance(60_000);
    expect(guards.check(visitor)).toEqual({ ok: true });
  });

  it("does not count requests that a guard refused", () => {
    const time = clock("2026-11-01T10:00:00Z");
    const guards = createGuards({ now: time.now, perMinute: 1, dailyCap: 2 });
    const visitor = requestFrom({ "x-real-ip": "203.0.113.7" });
    guards.check(visitor);
    guards.check(visitor);
    expect(guards.check(requestFrom({ "x-real-ip": "198.51.100.2" }))).toEqual({ ok: true });
  });
});

describe("per-instance limits", () => {
  it("trips at once with a daily cap of 0, so a container test needs no provider call", () => {
    const guards = createGuards({ dailyCap: 0 });
    expect(guards.check(requestFrom({}))).toMatchObject({ ok: false, reason: "daily_cap" });
  });

  it("trips the rate limit at once with 0 requests per minute", () => {
    const guards = createGuards({ perMinute: 0 });
    expect(guards.check(requestFrom({}))).toMatchObject({ ok: false, reason: "rate_limit" });
  });
});

describe("clampMaxTokens", () => {
  const guards = createGuards({ maxOutputTokens: 1200 });

  it("uses the ceiling when nothing or nonsense is requested", () => {
    expect(guards.clampMaxTokens()).toBe(1200);
    expect(guards.clampMaxTokens(-5)).toBe(1200);
    expect(guards.clampMaxTokens(Number.NaN)).toBe(1200);
  });

  it("keeps smaller requests and caps larger ones", () => {
    expect(guards.clampMaxTokens(300)).toBe(300);
    expect(guards.clampMaxTokens(50_000)).toBe(1200);
  });
});

describe("checkInputSize", () => {
  it("trips above the limit only", () => {
    const guards = createGuards();
    expect(guards.checkInputSize(100, 100)).toEqual({ ok: true });
    expect(guards.checkInputSize(101, 100)).toMatchObject({ ok: false, reason: "input_too_large" });
  });
});
