import { NavLink } from 'react-router-dom';
import { orderedCategories } from '@/tools/categories';
import { tools } from '@/tools/registry';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
      <div className="flex items-center justify-between px-4 py-3.5">
        <NavLink to="/" className="text-[15px] font-semibold tracking-tight">
          codedev<span className="text-muted-foreground">.tools</span>
        </NavLink>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {orderedCategories.map((cat) => {
          const items = tools.filter((t) => t.category === cat.key);
          if (items.length === 0) return null;
          const Icon = cat.icon;
          return (
            <div key={cat.key} className="mb-5">
              <div className="mb-1.5 flex items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                <Icon className="size-3.5" /> {cat.label}
              </div>
              {items.map((t) => (
                <NavLink
                  key={t.id}
                  to={`/tool/${t.id}`}
                  className={({ isActive }) =>
                    `block rounded-md px-2 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-foreground/10 font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                    }`
                  }
                >
                  {t.title}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="border-t px-4 py-2.5 text-[11px] text-muted-foreground/70">
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">⌘K</kbd> to search
      </div>
    </aside>
  );
}
