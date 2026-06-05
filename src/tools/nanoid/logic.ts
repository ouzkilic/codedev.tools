import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

// 64-char URL-safe alphabet → each random byte maps uniformly via `& 63`.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export const NANOID_OPTIONS: ToolOption[] = [
  { key: 'length', label: 'Length', type: 'text', default: '21', placeholder: '21' },
  { key: 'count', label: 'Count', type: 'text', default: '5', placeholder: '5' },
];

function clamp(raw: unknown, fallback: number, max: number): number {
  const n = parseInt(String(raw ?? ''), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, 1), max);
}

function nanoid(size: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = '';
  for (let i = 0; i < size; i++) id += ALPHABET[bytes[i] & 63];
  return id;
}

export function generateNanoids(options: ToolOptions): string {
  const length = clamp(options.length, 21, 512);
  const count = clamp(options.count, 1, 1000);
  return Array.from({ length: count }, () => nanoid(length)).join('\n');
}
