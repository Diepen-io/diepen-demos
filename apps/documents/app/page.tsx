import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { KeynoteFilmView } from "@diepen/ui/film/keynote-film-view";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { buildDocumentsKeynote } from "@/film/documents-keynote";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The film: one tax return at a fictional firm, from recorded fixtures. */
export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  const company = defaultPresetFor("documents");
  return (
    <BrandProvider fixed defaultProfile={company} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Document chaser" mode="film" presets={[company]} fit>
        <KeynoteFilmView film={buildDocumentsKeynote(company)} />
      </DemoShell>
    </BrandProvider>
  );
}
