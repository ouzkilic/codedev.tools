import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const SHADOW_OPTIONS: ToolOption[] = [
  { key: 'x', label: 'X', type: 'text', default: '0', placeholder: '0' },
  { key: 'y', label: 'Y', type: 'text', default: '4', placeholder: '4' },
  { key: 'blur', label: 'Blur', type: 'text', default: '12', placeholder: '12' },
  { key: 'spread', label: 'Spread', type: 'text', default: '0', placeholder: '0' },
  { key: 'color', label: 'Color', type: 'text', default: 'rgba(0,0,0,0.25)', placeholder: 'rgba(0,0,0,0.25)' },
  { key: 'inset', label: 'Inset', type: 'toggle', default: false },
];

export function buildShadow(options: ToolOptions): string {
  const px = (k: string, d: string) => `${(String(options[k] ?? d).trim() || d)}px`;
  const color = String(options.color ?? 'rgba(0,0,0,0.25)').trim();
  const inset = options.inset ? 'inset ' : '';
  return `${inset}${px('x', '0')} ${px('y', '4')} ${px('blur', '12')} ${px('spread', '0')} ${color}`;
}

export function boxShadowCss(options: ToolOptions): string {
  return `box-shadow: ${buildShadow(options)};`;
}
