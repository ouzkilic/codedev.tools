import type { ToolLogic } from '@/hooks/useToolState';

export const sortLinesLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Sort by',
      type: 'select',
      default: 'alpha',
      choices: [
        { value: 'alpha', label: 'Alphabetical' },
        { value: 'numeric', label: 'Numeric' },
        { value: 'length', label: 'Length' },
      ],
    },
    {
      key: 'order',
      label: 'Order',
      type: 'select',
      default: 'asc',
      choices: [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' },
      ],
    },
    { key: 'ci', label: 'Case-insensitive', type: 'toggle', default: false },
  ],
  transform(input: string, ctx): string {
    const mode = String(ctx?.options.mode ?? 'alpha');
    const ci = Boolean(ctx?.options.ci);
    const lines = input.split('\n');

    const sorted = [...lines].sort((a, b) => {
      if (mode === 'numeric') return (parseFloat(a) || 0) - (parseFloat(b) || 0);
      if (mode === 'length') return a.length - b.length;
      const A = ci ? a.toLowerCase() : a;
      const B = ci ? b.toLowerCase() : b;
      return A < B ? -1 : A > B ? 1 : 0;
    });

    if (ctx?.options.order === 'desc') sorted.reverse();
    return sorted.join('\n');
  },
};
