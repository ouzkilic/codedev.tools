import type { ReactNode } from 'react';

interface Props {
  left: ReactNode;
  right: ReactNode;
  result: ReactNode;
  toolbar?: ReactNode;
  error?: string | null;
  leftLabel?: string;
  rightLabel?: string;
}

// Two side-by-side inputs with a full-width diff result below.
export function CompareLayout({
  left, right, result, toolbar, error,
  leftLabel = 'Original', rightLabel = 'Changed',
}: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      {toolbar && <div className="flex flex-wrap items-center gap-3">{toolbar}</div>}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col">
          <span className="mb-1 text-xs text-muted-foreground">{leftLabel}</span>
          {left}
        </div>
        <div className="flex flex-col">
          <span className="mb-1 text-xs text-muted-foreground">{rightLabel}</span>
          {right}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border">{result}</div>
    </div>
  );
}
