import type { ToolLogic } from '@/hooks/useToolState';

function format(n: number): string {
  const rounded = Math.round(n * 10000) / 10000;
  return String(rounded);
}

export const percentageLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'of', label: 'A% of B' },
        { value: 'percent-of', label: 'A is what % of B' },
        { value: 'change', label: '% change from A to B' },
      ],
      default: 'of',
    },
  ],
  secondary: { label: 'Value B', placeholder: 'Enter number B' },
  transform(input, ctx) {
    const mode = String(ctx?.options.mode ?? 'of');
    const a = parseFloat(input.trim());
    const b = parseFloat((ctx?.secondary ?? '').trim());

    if (Number.isNaN(a)) {
      throw new Error('Value A is not a valid number');
    }
    if (Number.isNaN(b)) {
      throw new Error('Value B is not a valid number');
    }

    if (mode === 'of') {
      return format((a / 100) * b);
    }

    if (mode === 'percent-of') {
      if (b === 0) {
        throw new Error('Value B cannot be zero');
      }
      return format((a / b) * 100);
    }

    if (mode === 'change') {
      if (a === 0) {
        throw new Error('Value A cannot be zero');
      }
      return format(((b - a) / a) * 100);
    }

    throw new Error(`Unknown mode: ${mode}`);
  },
};
