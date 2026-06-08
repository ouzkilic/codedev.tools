import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

// Crockford's Base32 (excludes I, L, O, U).
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const ULID_OPTIONS: ToolOption[] = [
  { key: 'count', label: 'Count', type: 'text', default: '5', placeholder: '5' },
];

function encodeTime(time: number, length: number): string {
  let out = '';
  for (let i = length - 1; i >= 0; i--) {
    out = ENCODING[time % 32] + out;
    time = Math.floor(time / 32);
  }
  return out;
}

function encodeRandom(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = '';
  for (let i = 0; i < length; i++) out += ENCODING[bytes[i] % 32];
  return out;
}

export function generateUlid(now: number): string {
  return encodeTime(now, 10) + encodeRandom(16);
}

export function generateUlids(options: ToolOptions, now: number): string {
  const count = Math.min(Math.max(parseInt(String(options.count ?? '1'), 10) || 1, 1), 1000);
  return Array.from({ length: count }, () => generateUlid(now)).join('\n');
}
