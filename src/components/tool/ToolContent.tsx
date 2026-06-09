import { getToolSeo } from '@/data/seo-content';
import type { RegistryTool } from '@/tools/registry';

/**
 * Descriptive, indexable content rendered below each tool: about, common uses,
 * FAQ and a privacy note. Improves SEO and helps first-time users. Content comes
 * from src/data/seo-content.json with sensible fallbacks when an entry is missing.
 */
export function ToolContent({ tool }: { tool: RegistryTool }) {
  const seo = getToolSeo(tool.id);
  const intro = seo.intro ?? tool.description;
  const hasUseCases = (seo.useCases?.length ?? 0) > 0;
  const hasFaq = (seo.faq?.length ?? 0) > 0;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 px-6 pb-16 pt-4 text-sm leading-relaxed">
      <div className="space-y-2">
        <h2 className="text-base font-semibold tracking-tight">About {tool.title}</h2>
        <p className="text-muted-foreground">{intro}</p>
      </div>

      {hasUseCases && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold tracking-tight">Common uses</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {seo.useCases!.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      )}

      {hasFaq && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
          {seo.faq!.map((f) => (
            <div key={f.q} className="space-y-1">
              <h3 className="font-medium text-foreground">{f.q}</h3>
              <p className="text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-base font-semibold tracking-tight">Privacy</h2>
        <p className="text-muted-foreground">
          {tool.title} runs entirely in your browser. Your data is never uploaded — all
          processing happens locally on your device, so it works offline and keeps sensitive
          input private.
        </p>
      </div>
    </section>
  );
}
