import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const BEZIER_OPTIONS: ToolOption[] = [
  { key: 'x1', label: 'X1', type: 'text', placeholder: '0.25', default: '0.25' },
  { key: 'y1', label: 'Y1', type: 'text', placeholder: '0.1', default: '0.1' },
  { key: 'x2', label: 'X2', type: 'text', placeholder: '0.25', default: '0.25' },
  { key: 'y2', label: 'Y2', type: 'text', placeholder: '1', default: '1' },
];

function parse(value: ToolOptions[string], fallback: number): number {
  const n = parseFloat(String(value ?? ''));
  return Number.isNaN(n) ? fallback : n;
}

export function buildBezier(options: ToolOptions): string {
  const x1 = parse(options.x1, 0.25);
  const y1 = parse(options.y1, 0.1);
  const x2 = parse(options.x2, 0.25);
  const y2 = parse(options.y2, 1);
  return 'transition-timing-function: cubic-bezier(' + [x1, y1, x2, y2].join(', ') + ');';
}
