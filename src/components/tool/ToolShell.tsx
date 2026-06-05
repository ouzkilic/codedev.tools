import type { ReactNode } from 'react';

export function ToolShell({
  title, description, children,
}: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-5 p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
