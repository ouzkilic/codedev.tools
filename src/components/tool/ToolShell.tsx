import type { ReactNode } from 'react';

export function ToolShell({
  title, description, children,
}: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <header>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
