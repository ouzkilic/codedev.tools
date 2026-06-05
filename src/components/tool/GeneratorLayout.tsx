import type { ReactNode } from 'react';

interface Props {
  toolbar?: ReactNode;
  actions?: ReactNode;
  output: ReactNode;
  error?: string | null;
}

// Layout for generator tools: options + actions on top, full-width output below.
export function GeneratorLayout({ toolbar, actions, output, error }: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="min-h-0 flex-1">{output}</div>
    </div>
  );
}
