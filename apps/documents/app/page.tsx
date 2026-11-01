import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { DocumentsFilm } from "@/ui/documents-film";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The film: one tax return at a fictional firm, from recorded fixtures. */
export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  return (
    <BrandProvider fixed defaultProfile={defaultPresetFor("documents")} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Document chaser" mode="film" fit>
        <DocumentsFilm />
      </DemoShell>
    </BrandProvider>
  );
}
