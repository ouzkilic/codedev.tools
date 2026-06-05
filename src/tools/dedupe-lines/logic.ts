import type { ToolLogic } from '@/hooks/useToolState';

export const dedupeLinesLogic: ToolLogic = {
  options: [
    { key: 'trim', label: 'Trim lines', type: 'toggle', default: false },
    { key: 'ci', label: 'Case-insensitive', type: 'toggle', default: false },
  ],
  transform(input: string, ctx): string {
    const trim = Boolean(ctx?.options.trim);
    const ci = Boolean(ctx?.options.ci);
    const seen = new Set<string>();
    const out: string[] = [];

    for (const raw of input.split('\n')) {
      const line = trim ? raw.trim() : raw;
      const key = ci ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(line);
      }
    }
    return out.join('\n');
  },
};
