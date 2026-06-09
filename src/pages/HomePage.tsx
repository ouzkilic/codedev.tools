import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Code2, Clock } from 'lucide-react';
import { tools, toolsByCategory, findTool } from '@/tools/registry';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useRecentTools } from '@/hooks/useRecentTools';

export function HomePage() {
  useDocumentMeta(
    'Developer tools that run in your browser',
    'Free, open-source formatters, parsers, converters and generators for JSON, XML, CSV, YAML, schemas and more. Everything runs in your browser — no data is ever sent to a server.',
    '/',
  );

  const recent = useRecentTools().map(findTool).filter((t) => t !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          codedev<span className="text-muted-foreground">.tools</span>
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {tools.length}+ formatters, parsers, converters and generators for developers.
          Everything runs in your browser — your data never leaves your device.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4" /> 100% client-side
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="size-4" /> No sign-up, no ads
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Code2 className="size-4" /> Open source
          </span>
          <span className="opacity-70">Press ⌘K to search</span>
        </div>
      </header>

      {recent.length > 0 && (
        <section aria-labelledby="cat-recent" className="mb-12">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <h2 id="cat-recent" className="text-sm font-semibold tracking-tight">Recently used</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((t) => {
              const ToolIcon = t.icon;
              return (
                <Link
                  key={t.id}
                  to={`/tool/${t.id}`}
                  className="group inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                >
                  <ToolIcon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  {t.title}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="space-y-12">
        {toolsByCategory.map((cat) => {
          const Icon = cat.icon;
          return (
            <section key={cat.key} aria-labelledby={`cat-${cat.key}`} className="scroll-mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <h2 id={`cat-${cat.key}`} className="text-sm font-semibold tracking-tight">
                  {cat.label}
                </h2>
                <span className="text-xs text-muted-foreground/60">{cat.items.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((t) => {
                  const ToolIcon = t.icon;
                  return (
                    <Link
                      key={t.id}
                      to={`/tool/${t.id}`}
                      className="group flex flex-col gap-1.5 bg-background p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="flex size-7 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground transition-colors group-hover:text-foreground">
                          <ToolIcon className="size-3.5" />
                        </span>
                        {t.title}
                      </div>
                      <div className="text-xs leading-relaxed text-muted-foreground">
                        {t.description}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
