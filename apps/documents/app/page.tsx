import { DocumentsFilmStage } from "@/film/documents-film-stage";
import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  return (
    <BrandProvider fixed defaultProfile={defaultPresetFor("documents")} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Document chaser" mode="film">
        <DocumentsFilmStage />
      </DemoShell>
    </BrandProvider>
  );
}
