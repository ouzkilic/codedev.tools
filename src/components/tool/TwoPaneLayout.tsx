import type { ReactNode } from 'react';

export function TwoPaneLayout({
  left, right, actions, error,
}: { left: ReactNode; right: ReactNode; actions?: ReactNode; error?: string | null }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-end gap-2">{actions}</div>
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
