import { z } from "zod";
import type { TaskSpec } from "../task-spec.ts";

export type DocumentCheckContext = {
  /** What the business asked for, for example "Annual payslip summary 2025". */
  requestedDocument: string;
  clientName: string;
  taxYear: number;
  /** Text from an OCR adapter, when one ran. Without it the model reads the attached file itself. */
  ocrText?: string;
};

export const documentIssueKinds = [
  "missing_page",
  "missing_signature",
  "wrong_year",
  "wrong_person",
  "wrong_document",
  "unreadable",
  "other",
] as const;

const figure = z.object({
  label: z.string(),
  value: z.string().describe("Exactly as printed, with the currency or unit."),
});

export const documentCheckSchema = z.object({
  documentType: z.string().describe("What the document actually is, in plain English."),
  matchesRequest: z.boolean(),
  person: z.string().nullable().describe("The person the document is about. null when it shows no name."),
  year: z.number().int().nullable().describe("The year the document covers. null when it shows none."),
  pageCount: z.number().int().optional(),
  signed: z.boolean().optional().describe("Only when the document has a place for a signature."),
  issues: z.array(z.object({ kind: z.enum(documentIssueKinds), detail: z.string() })),
  keyFigures: z.array(figure).describe("Up to five figures an accountant needs from this document."),
  summary: z.string().describe("Two sentences for the accountant."),
  status: z.enum(["ok", "problem"]),
});

export type DocumentCheck = z.infer<typeof documentCheckSchema>;

export const documentCheckTask: TaskSpec<DocumentCheckContext, DocumentCheck> = {
  id: "document-check",
  role: "analysis",
  instructions: () =>
    [
      "A client uploaded one document for the business. The file is attached to the last message. When the context has OCR text, use it together with the file.",
      "Check the document against the requested document, the client's name and the tax year in the context.",
      "",
      "Report an issue for each of these that is true:",
      "- missing_page: page numbers jump, a page says 'continued' with no next page, or a form is clearly cut off.",
      "- missing_signature: the document has a signature field that is empty.",
      "- wrong_year: the document covers a different year than the tax year.",
      "- wrong_person: the name on the document is not the client's name.",
      "- wrong_document: it is a different kind of document than the one requested.",
      "- unreadable: a part you need cannot be read. Never guess a figure you cannot read.",
      "- other: anything else the accountant must know, in one sentence.",
      "",
      "status is ok only when there are no issues, otherwise problem.",
      "Write the summary for the accountant: what the document is and what, if anything, the client must send again.",
      "Do not give tax advice and do not judge whether a figure is good or bad.",
    ].join("\n"),
  outputSchema: documentCheckSchema,
};
