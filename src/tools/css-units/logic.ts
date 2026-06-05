import type { ToolLogic } from '@/hooks/useToolState';

export const cssUnitsLogic: ToolLogic = {
  options: [
    { key: 'base', label: 'Root font size (px)', type: 'text', default: '16', placeholder: '16' },
  ],
  transform(input, ctx) {
    const base = parseFloat(String(ctx?.options.base ?? '16')) || 16;
    const match = input.trim().match(/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i);
    if (!match) throw new Error('Enter a value like "24px", "1.5rem" or "2em".');

    const value = parseFloat(match[1]);
    const unit = (match[2] ?? 'px').toLowerCase();
    const px = unit === 'px' ? value : value * base;

    const fmt = (n: number) => parseFloat(n.toFixed(4)).toString();
    return [
      `px:   ${fmt(px)}px`,
      `rem:  ${fmt(px / base)}rem`,
      `em:   ${fmt(px / base)}em`,
    ].join('\n');
  },
};
