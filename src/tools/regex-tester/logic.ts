import type { ToolLogic } from '@/hooks/useToolState';

export const regexTesterLogic: ToolLogic = {
  options: [
    { key: 'pattern', label: 'Pattern', type: 'text', default: '', placeholder: '\\d+' },
    { key: 'flags', label: 'Flags', type: 'text', default: 'g', placeholder: 'gim' },
  ],
  transform(input, ctx) {
    const pattern = String(ctx?.options.pattern ?? '');
    if (!pattern) return 'Enter a pattern in the toolbar.';
    const rawFlags = String(ctx?.options.flags ?? 'g');
    const flags = rawFlags.includes('g') ? rawFlags : rawFlags + 'g';

    let re: RegExp;
    try {
      re = new RegExp(pattern, flags);
    } catch (e) {
      throw new Error(`Invalid regex: ${e instanceof Error ? e.message : 'error'}`, { cause: e });
    }

    const matches = [...input.matchAll(re)];
    if (matches.length === 0) return 'No matches.';

    return matches
      .map((m, i) => {
        const lines = [`Match ${i + 1}: "${m[0]}" at index ${m.index}`];
        m.slice(1).forEach((g, gi) => {
          lines.push(`  group ${gi + 1}: ${g === undefined ? '(undefined)' : `"${g}"`}`);
        });
        return lines.join('\n');
      })
      .join('\n');
  },
};
