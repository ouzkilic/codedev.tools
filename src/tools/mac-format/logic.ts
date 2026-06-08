import type { ToolLogic } from '@/hooks/useToolState';

export const macFormatLogic: ToolLogic = {
  options: [
    {
      key: 'format',
      label: 'Separator',
      type: 'select',
      default: 'colon',
      choices: [
        { value: 'colon', label: 'Colon (aa:bb)' },
        { value: 'hyphen', label: 'Hyphen (aa-bb)' },
        { value: 'dot', label: 'Dot (aabb.ccdd)' },
        { value: 'none', label: 'None (aabbcc)' },
      ],
    },
    {
      key: 'case',
      label: 'Case',
      type: 'select',
      default: 'lower',
      choices: [
        { value: 'lower', label: 'Lowercase' },
        { value: 'upper', label: 'Uppercase' },
      ],
    },
  ],
  transform(input, ctx) {
    const format = String(ctx?.options.format ?? 'colon');
    const caseOpt = String(ctx?.options.case ?? 'lower');
    const hex = input.replace(/[^0-9a-fA-F]/g, '');
    if (hex.length !== 12) throw new Error('A MAC address has 12 hex digits.');
    const h = caseOpt === 'upper' ? hex.toUpperCase() : hex.toLowerCase();
    const pairs = h.match(/.{2}/g) ?? [];
    switch (format) {
      case 'hyphen':
        return pairs.join('-');
      case 'dot':
        return (h.match(/.{4}/g) ?? []).join('.');
      case 'none':
        return h;
      default:
        return pairs.join(':');
    }
  },
};
