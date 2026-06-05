import type { ToolLogic } from '@/hooks/useToolState';

export const wordFreqLogic: ToolLogic = {
  options: [
    { key: 'caseSensitive', label: 'Case-sensitive', type: 'toggle', default: false },
  ],
  transform(input, ctx) {
    const caseSensitive = Boolean(ctx?.options.caseSensitive);
    const text = caseSensitive ? input : input.toLowerCase();
    const words = text.match(/[\p{L}\p{N}']+/gu) ?? [];

    const counts = new Map<string, number>();
    for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);

    const sorted = [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
    );
    return sorted.map(([word, count]) => `${count}\t${word}`).join('\n');
  },
};
