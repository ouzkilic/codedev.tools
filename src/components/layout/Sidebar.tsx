import { NavLink } from 'react-router-dom';
import { orderedCategories } from '@/tools/categories';
import { tools } from '@/tools/registry';

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-3">
      <NavLink to="/" className="mb-4 block px-2 text-lg font-bold">
        codedev<span className="text-muted-foreground">.tools</span>
      </NavLink>
      {orderedCategories.map((cat) => {
        const items = tools.filter((t) => t.category === cat.key);
        if (items.length === 0) return null;
        const Icon = cat.icon;
        return (
          <div key={cat.key} className="mb-4">
            <div className="mb-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
              <Icon className="size-3.5" /> {cat.label}
            </div>
            {items.map((t) => (
              <NavLink
                key={t.id}
                to={`/tool/${t.id}`}
                className={({ isActive }) =>
                  `block rounded-md px-2 py-1.5 text-sm hover:bg-muted ${
                    isActive ? 'bg-muted font-medium' : ''
                  }`
                }
              >
                {t.title}
              </NavLink>
            ))}
          </div>
        );
      })}
    </aside>
  );
}
