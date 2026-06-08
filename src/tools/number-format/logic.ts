import type { ToolLogic } from '@/hooks/useToolState';

export const numberFormatLogic: ToolLogic = {
  options: [
    {
      key: 'separator',
      label: 'Separator',
      type: 'select',
      choices: [
        { value: ',', label: 'Comma' },
        { value: ' ', label: 'Space' },
        { value: '.', label: 'Dot' },
        { value: '', label: 'None' },
      ],
      default: ',',
    },
  ],
  transform(input, ctx): string {
    const trimmed = input.trim();
    if (trimmed === '') return '';

    const separator = String(ctx?.options.separator ?? ',');

    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
      throw new Error('Input is not a valid number');
    }

    const negative = trimmed.startsWith('-');
    const unsigned = negative ? trimmed.slice(1) : trimmed;
    const [integerPart, fractionPart] = unsigned.split('.');

    const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    let result = grouped;
    if (fractionPart !== undefined) {
      result += '.' + fractionPart;
    }
    if (negative) {
      result = '-' + result;
    }
    return result;
  },
};
