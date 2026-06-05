import type { Change } from 'diff';

interface Props {
  parts: Change[];
  /** Inline rendering (for word/char diffs); otherwise line-by-line. */
  inline?: boolean;
}

// Renders a jsdiff Change[] as a colored diff (additions green, removals red).
export function DiffViewer({ parts, inline }: Props) {
  if (parts.length === 0) {
    return <span className="text-sm text-muted-foreground">Diff appears here…</span>;
  }

  if (inline) {
    return (
      <pre className="whitespace-pre-wrap break-words p-3 font-mono text-sm leading-6">
        {parts.map((p, i) => (
          <span
            key={i}
            className={
              p.added
                ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                : p.removed
                  ? 'bg-red-500/20 text-red-700 line-through dark:text-red-300'
                  : ''
            }
          >
            {p.value}
          </span>
        ))}
      </pre>
    );
  }

  const rows: { line: string; added?: boolean; removed?: boolean; key: string }[] = [];
  parts.forEach((p, pi) => {
    const lines = p.value.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    lines.forEach((line, li) =>
      rows.push({ line, added: p.added, removed: p.removed, key: `${pi}-${li}` }),
    );
  });

  return (
    <div className="p-1 font-mono text-sm leading-6">
      {rows.map((r) => (
        <div
          key={r.key}
          className={`flex ${
            r.added ? 'bg-green-500/15' : r.removed ? 'bg-red-500/15' : ''
          }`}
        >
          <span className="w-6 shrink-0 select-none text-center text-muted-foreground">
            {r.added ? '+' : r.removed ? '-' : ''}
          </span>
          <span className="whitespace-pre-wrap break-words">{r.line || ' '}</span>
        </div>
      ))}
    </div>
  );
}
