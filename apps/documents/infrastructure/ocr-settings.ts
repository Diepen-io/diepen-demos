import { z } from "zod";

/** Which OCR service runs. Claude by default; Google Document AI needs its three settings. */
export type OcrSettings =
  | { provider: "claude" }
  | { provider: "google-document-ai"; project: string; location: string; processorId: string };

type Env = Record<string, string | undefined>;

const providerSchema = z.enum(["claude", "google-document-ai"]);

const googleVariables = {
  project: "GOOGLE_CLOUD_PROJECT",
  location: "GOOGLE_DOCUMENT_AI_LOCATION",
  processorId: "GOOGLE_DOCUMENT_AI_PROCESSOR_ID",
} as const;

export class OcrSettingsError extends Error {
  override readonly name = "OcrSettingsError";
}

export function readOcrSettings(env: Env = process.env): OcrSettings {
  const raw = env.OCR_PROVIDER?.trim() || "claude";
  const provider = providerSchema.safeParse(raw);
  if (!provider.success) {
    throw new OcrSettingsError(`OCR_PROVIDER "${raw}" is unknown. Use "claude" or "google-document-ai".`);
  }
  if (provider.data === "claude") return { provider: "claude" };

  const values = Object.entries(googleVariables).map(([key, variable]) => [key, variable, env[variable]?.trim()] as const);
  const missing = values.filter(([, , value]) => !value).map(([, variable]) => variable);
  if (missing.length > 0) {
    throw new OcrSettingsError(`OCR_PROVIDER is google-document-ai, but these are not set: ${missing.join(", ")}.`);
  }
  const setting = (key: keyof typeof googleVariables) => values.find(([name]) => name === key)?.[2] ?? "";
  return { provider: "google-document-ai", project: setting("project"), location: setting("location"), processorId: setting("processorId") };
}
