import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const GRADIENT_OPTIONS: ToolOption[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    default: 'linear',
    choices: [
      { value: 'linear', label: 'Linear' },
      { value: 'radial', label: 'Radial' },
    ],
  },
  { key: 'angle', label: 'Angle/Shape', type: 'text', default: '90deg', placeholder: '90deg' },
  { key: 'from', label: 'From', type: 'text', default: '#ff6a00', placeholder: '#ff6a00' },
  { key: 'to', label: 'To', type: 'text', default: '#ee0979', placeholder: '#ee0979' },
];

export function buildGradient(options: ToolOptions): string {
  const type = String(options.type ?? 'linear');
  const angle = String(options.angle ?? '90deg').trim();
  const from = String(options.from ?? '#ff6a00').trim();
  const to = String(options.to ?? '#ee0979').trim();
  const head = type === 'radial' ? angle || 'circle' : angle || '90deg';
  return `${type}-gradient(${head}, ${from}, ${to})`;
}

export function gradientCss(options: ToolOptions): string {
  return `background: ${buildGradient(options)};`;
}
