import { Link } from 'react-router-dom';
import { tools } from '@/tools/registry';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function HomePage() {
  useDocumentMeta(
    'Developer tools that run in your browser',
    'JSON, XML, CSV and Excel formatters and converters; JSON→Zod and JSON→TypeScript schema generators. Everything runs in your browser — no data is sent to a server.',
    '/',
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">codedev.tools</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Formatters, parsers and converters for developers. Everything runs in your browser —
          no data is ever sent to a server.
          <span className="ml-1.5 opacity-70">Press ⌘K to search.</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              to={`/tool/${t.id}`}
              className="group flex flex-col gap-2 bg-background p-5 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-2.5 font-medium">
                <span className="flex size-8 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground transition-colors group-hover:text-foreground">
                  <Icon className="size-4" />
                </span>
                {t.title}
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">{t.description}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
