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
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold">codedev.tools</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Everything runs in your browser. No data is ever sent to a server.
        <span className="ml-2 opacity-70">(Press Cmd/Ctrl + K to search)</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              to={`/tool/${t.id}`}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <div className="mb-1 flex items-center gap-2 font-medium">
                <Icon className="size-4" /> {t.title}
              </div>
              <div className="text-sm text-muted-foreground">{t.description}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
