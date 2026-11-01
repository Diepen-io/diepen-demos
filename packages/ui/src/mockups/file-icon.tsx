export type FileKind = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

const looks: Record<FileKind, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "#d93025" },
  image: { label: "IMG", color: "#c2410c" },
  doc: { label: "DOC", color: "#1f6feb" },
  sheet: { label: "XLS", color: "#188038" },
  zip: { label: "ZIP", color: "#52525b" },
  other: { label: "FILE", color: "#71717a" },
};

const byExtension: Record<string, FileKind> = {
  pdf: "pdf", jpg: "image", jpeg: "image", png: "image", heic: "image", webp: "image",
  doc: "doc", docx: "doc", txt: "doc", xls: "sheet", xlsx: "sheet", csv: "sheet", zip: "zip",
};

export function fileKindOf(name: string): FileKind {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return byExtension[extension] ?? "other";
}

/** A page with a folded corner and the type written on it, coloured per type like a file manager. */
export function FileIcon({ kind, size = 28 }: { kind: FileKind; size?: number }) {
  const look = looks[kind];
  return (
    <svg width={size * 0.82} height={size} viewBox="0 0 23 28" aria-hidden="true" className="shrink-0">
      <path d="M3 0h12l8 8v17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z" fill={look.color} />
      <path d="M15 0v5a3 3 0 0 0 3 3h5z" fill="#fff" fillOpacity="0.35" />
      <text x="11.5" y="21" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#fff" fontFamily="var(--font-geist-sans), system-ui">
        {look.label}
      </text>
    </svg>
  );
}
