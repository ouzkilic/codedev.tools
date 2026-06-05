import { diffLines, diffWords, diffChars, type Change } from 'diff';

export type DiffMode = 'line' | 'word' | 'char';

export interface DiffOpts {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
}

export function computeTextDiff(
  left: string,
  right: string,
  mode: DiffMode,
  opts: DiffOpts = {},
): Change[] {
  if (mode === 'word') return diffWords(left, right, { ignoreCase: opts.ignoreCase });
  if (mode === 'char') return diffChars(left, right, { ignoreCase: opts.ignoreCase });
  // diffLines doesn't support ignoreCase; that option applies to word/char modes only.
  return diffLines(left, right, { ignoreWhitespace: opts.ignoreWhitespace });
}

export function diffSummary(parts: Change[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const p of parts) {
    if (p.added) added += p.count ?? 0;
    else if (p.removed) removed += p.count ?? 0;
  }
  return { added, removed };
}
