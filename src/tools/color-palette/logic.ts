import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const PALETTE_OPTIONS: ToolOption[] = [
  { key: 'count', label: 'Count', type: 'text', placeholder: '5', default: '5' },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function buildPalette(options: ToolOptions): string {
  const parsed = parseInt(String(options.count ?? '5'), 10);
  const n = clamp(Number.isNaN(parsed) ? 5 : parsed, 1, 50);
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    const value = Math.floor(Math.random() * 0x1000000);
    lines.push('#' + value.toString(16).padStart(6, '0'));
  }
  return lines.join('\n');
}
