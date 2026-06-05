import type { ToolLogic } from '@/hooks/useToolState';

export const reverseLogic: ToolLogic = {
  options: [
    {
      key: 'unit',
      label: 'Reverse by',
      type: 'select',
      default: 'characters',
      choices: [
        { value: 'characters', label: 'Characters' },
        { value: 'words', label: 'Words' },
        { value: 'lines', label: 'Lines' },
      ],
    },
  ],
  transform(input, ctx) {
    const unit = String(ctx?.options.unit ?? 'characters');
    if (unit === 'lines') return input.split('\n').reverse().join('\n');
    if (unit === 'words') return input.split(/(\s+)/).reverse().join('');
    return [...input].reverse().join('');
  },
};
