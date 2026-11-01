/**
 * What the firm asks its client for: the six documents of one tax return. The client, the tax
 * year and the items stay the same for every company profile (decision N2).
 */

export const itemIds = [
  "engagement-letter",
  "payslip-summary",
  "bank-interest",
  "donation-receipt",
  "home-office",
  "health-insurance",
] as const;

export type ItemId = (typeof itemIds)[number];

/** Every item the client uploads a file for. The engagement letter is signed on the page instead. */
export type UploadItemId = Exclude<ItemId, "engagement-letter">;

export const uploadItemIds = itemIds.filter((id): id is UploadItemId => id !== "engagement-letter");

export type ItemState = "missing" | "received" | "checked" | "problem";

export type RequestItem = {
  id: ItemId;
  label: string;
  kind: "signature" | "upload";
  /** What the client reads under the label. */
  detail: string;
  /** The document part of a filed name, for example "Payslip-summary". */
  fileLabel: string;
  /** The document itself has a signature field that must be filled. */
  needsSignature: boolean;
  state: ItemState;
  /** Where `checkAborted` returns to: the state the item had before its latest upload. */
  stateBeforeUpload?: "missing" | "problem";
};

export type Client = { name: string; firstName: string; lastName: string; address: string };

export type DocumentRequest = {
  id: string;
  client: Client;
  taxYear: number;
  /** Story time without a zone offset, for example "2026-03-31". */
  dueDate: string;
  sentAt: string;
  items: RequestItem[];
};

export const client: Client = {
  name: "Daniel Okafor",
  firstName: "Daniel",
  lastName: "Okafor",
  address: "14 Sample Street, 00000 Exampletown",
};

export const taxYear = 2025;

/** When the firm sends the request in the story: Monday morning. */
export const requestSentAt = "2026-03-09T09:00";

const dueDate = "2026-03-31";

type ItemTemplate = Omit<RequestItem, "state" | "stateBeforeUpload">;

const templates: readonly ItemTemplate[] = [
  {
    id: "engagement-letter",
    label: "Signed engagement letter",
    kind: "signature",
    detail: "Sign on this page",
    fileLabel: "Engagement-letter",
    needsSignature: false,
  },
  {
    id: "payslip-summary",
    label: "Annual payslip summary 2025",
    kind: "upload",
    detail: "From your employer, all pages",
    fileLabel: "Payslip-summary",
    needsSignature: false,
  },
  {
    id: "bank-interest",
    label: "Bank interest statement 2025",
    kind: "upload",
    detail: "From each bank, for 2025",
    fileLabel: "Bank-interest-statement",
    needsSignature: false,
  },
  {
    id: "donation-receipt",
    label: "Donation receipt 2025",
    kind: "upload",
    detail: "One receipt per donation",
    fileLabel: "Donation-receipt",
    needsSignature: false,
  },
  {
    id: "home-office",
    label: "Home office confirmation 2025",
    kind: "upload",
    detail: "Signed by your employer",
    fileLabel: "Home-office-confirmation",
    needsSignature: true,
  },
  {
    id: "health-insurance",
    label: "Health insurance statement 2025",
    kind: "upload",
    detail: "From your insurer, a photo works",
    fileLabel: "Health-insurance-statement",
    needsSignature: false,
  },
];

/** The request as the firm sends it: all six items missing. */
export function createTaxReturnRequest(sentAt: string): DocumentRequest {
  return {
    id: "okafor-2025",
    client,
    taxYear,
    dueDate,
    sentAt,
    items: templates.map((template) => ({ ...template, state: "missing" })),
  };
}

/** The template of one item, for labels and file names. */
export function requestItem(id: ItemId): RequestItem {
  const template = templates.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`Unknown request item "${id}"`);
  return { ...template, state: "missing" };
}

export function isUploadItemId(value: string): value is UploadItemId {
  return (uploadItemIds as readonly string[]).includes(value);
}
