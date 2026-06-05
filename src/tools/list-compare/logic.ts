import type { ToolLogic } from '@/hooks/useToolState';

const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
const uniq = (arr: string[]) => [...new Set(arr)];

export const listCompareLogic: ToolLogic = {
  secondary: { label: 'List B', placeholder: 'one item per line' },
  options: [
    {
      key: 'op',
      label: 'Operation',
      type: 'select',
      default: 'intersection',
      choices: [
        { value: 'intersection', label: 'In both (intersection)' },
        { value: 'union', label: 'In either (union)' },
        { value: 'a-only', label: 'Only in A' },
        { value: 'b-only', label: 'Only in B' },
        { value: 'symmetric', label: 'In one but not both' },
      ],
    },
  ],
  transform(input, ctx) {
    const a = toLines(input);
    const b = toLines(ctx?.secondary ?? '');
    const setA = new Set(a);
    const setB = new Set(b);
    const op = String(ctx?.options.op ?? 'intersection');

    let result: string[];
    switch (op) {
      case 'union': result = uniq([...a, ...b]); break;
      case 'a-only': result = uniq(a).filter((x) => !setB.has(x)); break;
      case 'b-only': result = uniq(b).filter((x) => !setA.has(x)); break;
      case 'symmetric':
        result = [...uniq(a).filter((x) => !setB.has(x)), ...uniq(b).filter((x) => !setA.has(x))];
        break;
      default: result = uniq(a).filter((x) => setB.has(x)); // intersection
    }
    return result.join('\n');
  },
};
