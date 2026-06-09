import { Link } from 'react-router-dom';
import { relatedTools } from '@/tools/registry';
import { CATEGORIES } from '@/tools/categories';
import type { RegistryTool } from '@/tools/registry';

/** "Related tools" links (same category) — internal linking for SEO and discovery. */
export function RelatedTools({ tool }: { tool: RegistryTool }) {
  const related = relatedTools(tool.id, 8);
  if (related.length === 0) return null;
  const label = CATEGORIES[tool.category].label;

  return (
    <nav aria-label="Related tools" className="mx-auto w-full max-w-3xl border-t px-6 py-8">
      <h2 className="mb-3 text-base font-semibold tracking-tight">More {label} tools</h2>
      <div className="flex flex-wrap gap-2">
        {related.map((t) => (
          <Link
            key={t.id}
            to={`/tool/${t.id}`}
            className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {t.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
