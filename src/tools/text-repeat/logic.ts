import type { ToolLogic } from '@/hooks/useToolState';

export const textRepeatLogic: ToolLogic = {
  options: [
    { key: 'count', label: 'Count', type: 'text', placeholder: '3', default: '3' },
    {
      key: 'separator',
      label: 'Separator',
      type: 'select',
      choices: [
        { value: '\n', label: 'Newline' },
        { value: ',', label: 'Comma' },
        { value: ' ', label: 'Space' },
        { value: '', label: 'None' },
      ],
      default: '\n',
    },
  ],
  transform(input: string, ctx?): string {
    const countRaw = String(ctx?.options.count ?? '3');
    const separator = String(ctx?.options.separator ?? '\n');
    const parsed = parseInt(countRaw, 10) || 1;
    const n = Math.min(Math.max(parsed, 1), 10000);
    return Array(n).fill(input).join(separator);
  },
};
