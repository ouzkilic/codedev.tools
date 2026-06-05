import type { ReactNode } from 'react';

export function TwoPaneLayout({
  left, right, actions, error, toolbar,
}: {
  left: ReactNode;
  right: ReactNode;
  actions?: ReactNode;
  error?: string | null;
  /** Optional controls (e.g. <ToolOptions />) shown on the left of the top bar. */
  toolbar?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">{toolbar}</div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col">{left}</div>
        <div className="flex flex-col">{right}</div>
      </div>
    </div>
  );
}
