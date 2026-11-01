import { container } from "@/infrastructure/container";
import { LiveDemo } from "@/ui/live-demo";
import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LivePage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  const company = defaultPresetFor("documents");
  return (
    <BrandProvider defaultProfile={company} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Document chaser" mode="live" presets={[company]}>
        <LiveDemo providerName={container.providerName} />
      </DemoShell>
    </BrandProvider>
  );
}
