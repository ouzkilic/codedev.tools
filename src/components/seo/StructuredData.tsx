import { useEffect } from 'react';
import { getToolSeo } from '@/data/seo-content';
import { CATEGORIES } from '@/tools/categories';
import type { RegistryTool } from '@/tools/registry';

const SITE = 'https://codedev.tools';

/** Builds the JSON-LD graph for a tool: SoftwareApplication + BreadcrumbList (+ FAQPage). */
function buildToolJsonLd(tool: RegistryTool) {
  const url = `${SITE}/tool/${tool.id}`;
  const seo = getToolSeo(tool.id);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'SoftwareApplication',
      name: tool.title,
      url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (web browser)',
      description: seo.intro ?? tool.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: CATEGORIES[tool.category].label, item: url },
        { '@type': 'ListItem', position: 3, name: tool.title, item: url },
      ],
    },
  ];
  if (seo.faq && seo.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: seo.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/**
 * Injects per-tool JSON-LD into <head> for crawlers that execute JS. The build-time
 * prerender bakes the same data into static HTML; this keeps the SPA correct in dev
 * and for JS-rendering crawlers. Replaces any previously-injected tool JSON-LD.
 */
export function StructuredData({ tool }: { tool: RegistryTool }) {
  useEffect(() => {
    document.querySelectorAll('script[data-tool-ld]').forEach((el) => el.remove());
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-tool-ld', '');
    script.textContent = JSON.stringify(buildToolJsonLd(tool));
    document.head.appendChild(script);
    return () => script.remove();
  }, [tool]);

  return null;
}
