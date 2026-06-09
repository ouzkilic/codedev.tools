export interface ToolFaq {
  q: string;
  a: string;
}

/** Per-tool SEO/help content. One file per tool under ./seo/<id>.json; missing entries fall back gracefully. */
export interface ToolSeo {
  /** 1-2 sentence plain-language description (richer than the meta tagline). */
  intro?: string;
  /** Short bullet list of common use cases. */
  useCases?: string[];
  /** Frequently asked questions, also surfaced as FAQPage structured data. */
  faq?: ToolFaq[];
}

// Eagerly aggregate every per-tool content file at build time (no network, no runtime cost).
const modules = import.meta.glob<{ default: ToolSeo }>('./seo/*.json', { eager: true });

const content: Record<string, ToolSeo> = {};
for (const [path, mod] of Object.entries(modules)) {
  const id = path.slice(path.lastIndexOf('/') + 1, -'.json'.length);
  content[id] = mod.default;
}

export function getToolSeo(id: string): ToolSeo {
  return content[id] ?? {};
}
