import { checkResultSchema } from "@/domain/check-result";
import { sampleDocuments } from "@/domain/sample-documents";
import type { GuardOptions, Guards } from "@diepen/ai/guards";
import { presets } from "@diepen/voice/presets";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

/**
 * Every guard the route can reach, the shared `guards` or one from `createGuards`, delegates to the
 * instance a test sets, so a test can trip the daily cap without touching the route.
 */
const guardState = vi.hoisted(() => ({ current: null as Guards | null }));

vi.mock("@diepen/ai/guards", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@diepen/ai/guards")>();
  const active = () => guardState.current ?? actual.createGuards({ perMinute: 1000, dailyCap: 1000 });
  const delegate: Guards = {
    check: (request) => active().check(request),
    clampMaxTokens: (requested) => active().clampMaxTokens(requested),
    checkInputSize: (chars, limit) => active().checkInputSize(chars, limit),
  };
  return { ...actual, guards: delegate, createGuards: (_options?: GuardOptions) => delegate };
});

async function useGuards(options: GuardOptions) {
  const actual = await vi.importActual<typeof import("@diepen/ai/guards")>("@diepen/ai/guards");
  guardState.current = actual.createGuards({ perMinute: 1000, ...options });
}

const pdfBytes = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n");
const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

function sampleFile(name: string): File {
  const png = name.endsWith(".png");
  return new File([png ? pngBytes : pdfBytes], name, { type: png ? "image/png" : "application/pdf" });
}

function post(fields: { file?: File; itemId?: string; profile?: string }, headers: Record<string, string> = {}) {
  const body = new FormData();
  if (fields.file) body.append("file", fields.file);
  if (fields.itemId !== undefined) body.append("itemId", fields.itemId);
  if (fields.profile !== undefined) body.append("profile", fields.profile);
  return new Request("https://documents.demo.example/api/check", {
    method: "POST",
    body,
    headers: { "x-forwarded-for": "203.0.113.20", ...headers },
  });
}

const validPost = () => post({ file: sampleFile("payslip-summary-2025.pdf"), itemId: "payslip-summary" });

beforeEach(async () => {
  await useGuards({ dailyCap: 1000 });
});

describe("POST /api/check validation @documents.own-file", () => {
  it("answers 400 without a file", async () => {
    const response = await POST(post({ itemId: "payslip-summary" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_request", issues: expect.any(Array) as unknown });
  });

  it("answers 400 for an unknown item and for the engagement letter", async () => {
    for (const itemId of ["tax-certificate", "engagement-letter", ""]) {
      const response = await POST(post({ file: sampleFile("payslip-summary-2025.pdf"), itemId }));
      expect(response.status, itemId).toBe(400);
      expect(await response.json()).toMatchObject({ error: "invalid_request" });
    }
  });

  it("answers 400 for profile JSON that does not parse or is no profile", async () => {
    for (const profile of ["{not json", JSON.stringify({ name: "Half a profile" })]) {
      const response = await POST(post({ file: sampleFile("payslip-summary-2025.pdf"), itemId: "payslip-summary", profile }));
      expect(response.status, profile).toBe(400);
    }
  });

  it("answers 413 for a file of 4,000,001 bytes", async () => {
    const bytes = new Uint8Array(4_000_001);
    bytes.set(pdfBytes);
    const response = await POST(post({ file: new File([bytes], "big.pdf", { type: "application/pdf" }), itemId: "payslip-summary" }));
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "file_too_large", maxBytes: 4_000_000 });
  });

  it("answers 413 from content-length over 4,400,000 before it reads the body", async () => {
    const response = await POST(
      post({ file: sampleFile("payslip-summary-2025.pdf"), itemId: "payslip-summary" }, { "content-length": "4400001" }),
    );
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ error: "file_too_large" });
  });

  it("answers 415 for a text file named .pdf", async () => {
    const text = new File(["Dear tax office, this is plain text."], "statement.pdf", { type: "application/pdf" });
    const response = await POST(post({ file: text, itemId: "bank-interest" }));
    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({
      error: "unsupported_file_type",
      accepted: ["application/pdf", "image/png", "image/jpeg"],
    });
  });
});

describe("POST /api/check answers @documents.own-file", () => {
  it.each(sampleDocuments.map((sample) => [sample.fileName, sample] as const))(
    "answers 200 with the response shape for %s",
    async (fileName, sample) => {
      const response = await POST(post({ file: sampleFile(fileName), itemId: sample.itemId }));
      expect(response.status).toBe(200);
      const body = (await response.json()) as Record<string, unknown>;
      expect(Object.keys(body).sort()).toEqual(["check", "filing", "itemEvent", "ocr", "provider"]);
      expect(checkResultSchema.parse(body.check)).toEqual(sample.result);
      expect(body.itemEvent).toBe(sample.result.status === "ok" ? "checkPassed" : "checkFailed");
      expect(body.filing).toEqual({ folder: expect.any(String) as unknown, fileName: expect.stringMatching(/^20\d\d_Okafor-/) as unknown });
      expect(body.provider).toBe("mock");
      expect(body.ocr).toBe("claude");
    },
  );

  it("accepts a profile and still answers from the recorded sample", async () => {
    const profile = JSON.stringify(presets["brickfern-property"]);
    const response = await POST(post({ file: sampleFile("donation-receipt-2025.pdf"), itemId: "donation-receipt", profile }));
    expect(response.status).toBe(200);
  });

  it("answers 429 with the film fallback when the guard trips", async () => {
    await useGuards({ dailyCap: 0 });
    const response = await POST(validPost());
    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ fallback: "film", reason: "daily_cap" });
  });

  it("does not count a request that fails validation against the guard", async () => {
    await useGuards({ dailyCap: 1 });
    expect((await POST(post({ itemId: "payslip-summary" }))).status).toBe(400);
    expect((await POST(post({ file: sampleFile("payslip-summary-2025.pdf"), itemId: "engagement-letter" }))).status).toBe(400);
    const text = new File(["plain text"], "notes.pdf", { type: "application/pdf" });
    expect((await POST(post({ file: text, itemId: "payslip-summary" }))).status).toBe(415);

    expect((await POST(validPost())).status).toBe(200);
    expect((await POST(validPost())).status).toBe(429);
  });
});
