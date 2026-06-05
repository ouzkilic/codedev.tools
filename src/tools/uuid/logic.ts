import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const UUID_OPTIONS: ToolOption[] = [
  { key: 'count', label: 'Count', type: 'text', default: '5', placeholder: '5' },
];

function clampCount(raw: ToolOptions['count']): number {
  const n = parseInt(String(raw ?? '1'), 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(Math.max(n, 1), 1000);
}

export function generateUuids(options: ToolOptions): string {
  const count = clampCount(options.count);
  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
}
