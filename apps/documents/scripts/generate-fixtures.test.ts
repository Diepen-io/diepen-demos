import { sampleDocuments } from "@/domain/sample-documents";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { decodePDFRawStream, PDFArray, PDFDocument, PDFRawStream, type PDFObject } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";
import { buildFixtures } from "./generate-fixtures";

const fixturesFolder = new URL("../public/fixtures/", import.meta.url);
const maxBytes = 300_000;

const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

/** pdf-lib writes standard-font text as hex strings, so "SAMPLE" can show up either way. */
const sampleText = /\(SAMPLE\)|<\s*53\s*41\s*4d\s*50\s*4c\s*45\s*>/i;

function contentText(object: PDFObject | undefined): string {
  if (object instanceof PDFRawStream) return new TextDecoder("latin1").decode(decodePDFRawStream(object).decode());
  if (object instanceof PDFArray) return object.asArray().map((_, index) => contentText(object.lookup(index))).join("\n");
  return "";
}

let fixtures: Map<string, Uint8Array>;

beforeAll(async () => {
  fixtures = await buildFixtures();
}, 120_000);

describe("buildFixtures @documents.upload", () => {
  it("builds one file for every sample document", () => {
    expect([...fixtures.keys()].sort()).toEqual(sampleDocuments.map((sample) => sample.fileName).sort());
  });

  it("matches every committed file in public/fixtures byte for byte", async () => {
    for (const [name, bytes] of fixtures) {
      const committed = await readFile(new URL(name, fixturesFolder));
      expect(sha256(bytes), name).toBe(sha256(committed));
    }
  });

  it("keeps every file under 300 KB", () => {
    for (const [name, bytes] of fixtures) expect(bytes.byteLength, name).toBeLessThan(maxBytes);
  });

  it("prints SAMPLE on every PDF page", async () => {
    for (const [name, bytes] of fixtures) {
      if (!name.endsWith(".pdf")) continue;
      const pdf = await PDFDocument.load(bytes);
      const pages = pdf.getPages();
      expect(pages.length, name).toBeGreaterThan(0);
      pages.forEach((page, index) => {
        expect(contentText(page.node.Contents()), `${name} page ${index + 1}`).toMatch(sampleText);
      });
    }
  });
});
