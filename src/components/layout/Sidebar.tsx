import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Github } from 'lucide-react';
import { orderedCategories } from '@/tools/categories';
import { tools, searchTools } from '@/tools/registry';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-2 py-1.5 text-sm transition-colors ${
    isActive
      ? 'bg-foreground/10 font-medium text-foreground'
      : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
  }`;

export function Sidebar() {
  const [query, setQuery] = useState('');
  const q = query.trim();
  const results = q ? searchTools(q) : [];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
      <div className="flex items-center justify-between px-4 py-3.5">
        <NavLink to="/" className="text-[15px] font-semibold tracking-tight">
          codedev<span className="text-muted-foreground">.tools</span>
        </NavLink>
        <ThemeToggle />
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
            className="h-8 w-full rounded-md border bg-background pl-8 pr-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring/50 focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {q ? (
          results.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">No tools match “{q}”.</p>
          ) : (
            <div className="mb-5">
              <div className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {results.length} result{results.length === 1 ? '' : 's'}
              </div>
              {results.map((t) => (
                <NavLink key={t.id} to={`/tool/${t.id}`} className={linkClass}>
                  {t.title}
                </NavLink>
              ))}
            </div>
          )
        ) : (
          orderedCategories.map((cat) => {
            const items = tools.filter((t) => t.category === cat.key);
            if (items.length === 0) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="mb-5">
                <div className="mb-1.5 flex items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  <Icon className="size-3.5" /> {cat.label}
                </div>
                {items.map((t) => (
                  <NavLink key={t.id} to={`/tool/${t.id}`} className={linkClass}>
                    {t.title}
                  </NavLink>
                ))}
              </div>
            );
          })
        )}
      </nav>

      <div className="space-y-2 border-t px-4 py-2.5 text-[11px] text-muted-foreground/70">
        <div>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">⌘K</kbd> /{' '}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Ctrl K</kbd> to search
        </div>
        <a
          href="https://github.com/ouzkilic/codedev.tools"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <Github className="size-3.5" /> Source on GitHub
        </a>
      </div>
    </aside>
  );
}
