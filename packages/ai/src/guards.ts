/**
 * Cost guards for every live AI route: a per-IP rate limit, a daily request cap and a ceiling on
 * output tokens. Counts live in server memory, so each server instance keeps its own (decision D3).
 */

export type GuardTrip = "rate_limit" | "daily_cap";

export type GuardResult =
  | { ok: true }
  | { ok: false; reason: GuardTrip; message: string };

export type GuardOptions = {
  /** Injected so tests can move time. */
  now?: () => number;
  perMinute?: number;
  dailyCap?: number;
  maxOutputTokens?: number;
};

/**
 * A route depends on this shape, so a container can inject its own instance. In a test,
 * `createGuards({ dailyCap: 0 })` or `createGuards({ perMinute: 0 })` trips on the first request.
 */
export type Guards = {
  /** Counts the request when it passes. Call it once per AI request. */
  check: (request: Request) => GuardResult;
  clampMaxTokens: (requested?: number) => number;
};

const windowMs = 60_000;

const tripMessages: Record<GuardTrip, string> = {
  rate_limit: "Too many messages in a minute. Here is the recorded film.",
  daily_cap: "The live demo is busy today. Here is the recorded film.",
};

function trip(reason: GuardTrip): GuardResult {
  return { ok: false, reason, message: tripMessages[reason] };
}

function positiveIntFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

/** The visitor's IP as the hosting proxy reports it. The first forwarded entry is the client. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function utcDay(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

export function createGuards(options: GuardOptions = {}): Guards {
  const now = options.now ?? Date.now;
  const perMinute = options.perMinute ?? positiveIntFromEnv("AI_RATE_LIMIT_PER_MINUTE", 12);
  const dailyCap = options.dailyCap ?? positiveIntFromEnv("AI_DAILY_REQUEST_CAP", 300);
  const maxOutputTokens =
    options.maxOutputTokens ?? positiveIntFromEnv("AI_MAX_OUTPUT_TOKENS", 4000);

  const recentByIp = new Map<string, number[]>();
  let day = utcDay(now());
  let requestsToday = 0;

  function pruneWindows(time: number) {
    for (const [ip, times] of recentByIp) {
      const recent = times.filter((t) => time - t < windowMs);
      if (recent.length === 0) recentByIp.delete(ip);
      else recentByIp.set(ip, recent);
    }
  }

  return {
    check(request) {
      const time = now();
      const today = utcDay(time);
      if (today !== day) {
        day = today;
        requestsToday = 0;
      }
      // Pruning every IP keeps the map from growing with visitors who never come back.
      pruneWindows(time);

      const ip = clientIp(request);
      const recent = recentByIp.get(ip) ?? [];
      if (recent.length >= perMinute) return trip("rate_limit");
      if (requestsToday >= dailyCap) return trip("daily_cap");

      recentByIp.set(ip, [...recent, time]);
      requestsToday += 1;
      return { ok: true };
    },

    clampMaxTokens(requested) {
      if (requested === undefined || !Number.isFinite(requested) || requested <= 0) {
        return maxOutputTokens;
      }
      return Math.min(Math.floor(requested), maxOutputTokens);
    },
  };
}

/** The one instance every route shares, so all routes count against the same limits. */
export const guards = createGuards();
