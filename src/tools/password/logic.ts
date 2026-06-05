import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

export const PASSWORD_OPTIONS: ToolOption[] = [
  { key: 'length', label: 'Length', type: 'text', default: '16', placeholder: '16' },
  { key: 'uppercase', label: 'A-Z', type: 'toggle', default: true },
  { key: 'lowercase', label: 'a-z', type: 'toggle', default: true },
  { key: 'numbers', label: '0-9', type: 'toggle', default: true },
  { key: 'symbols', label: 'Symbols', type: 'toggle', default: false },
  { key: 'count', label: 'Count', type: 'text', default: '1', placeholder: '1' },
];

function clamp(raw: unknown, fallback: number, max: number): number {
  const n = parseInt(String(raw ?? ''), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, 1), max);
}

// Unbiased random index via rejection sampling.
function randomIndex(max: number): number {
  const limit = 256 - (256 % max);
  const buf = new Uint8Array(1);
  let byte: number;
  do {
    crypto.getRandomValues(buf);
    byte = buf[0];
  } while (byte >= limit);
  return byte % max;
}

export function generatePasswords(options: ToolOptions): string {
  const length = clamp(options.length, 16, 256);
  const count = clamp(options.count, 1, 100);

  let pool = '';
  if (options.uppercase) pool += SETS.uppercase;
  if (options.lowercase) pool += SETS.lowercase;
  if (options.numbers) pool += SETS.numbers;
  if (options.symbols) pool += SETS.symbols;
  if (!pool) throw new Error('Select at least one character set.');

  const make = () =>
    Array.from({ length }, () => pool[randomIndex(pool.length)]).join('');
  return Array.from({ length: count }, make).join('\n');
}
