import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const TOKEN_OPTIONS: ToolOption[] = [
  {
    key: 'format',
    label: 'Format',
    type: 'select',
    choices: [
      { value: 'hex', label: 'Hex' },
      { value: 'base64url', label: 'Base64URL' },
      { value: 'alphanumeric', label: 'Alphanumeric' },
    ],
    default: 'hex',
  },
  { key: 'bytes', label: 'Bytes', type: 'text', default: '32', placeholder: '32' },
  { key: 'count', label: 'Count', type: 'text', default: '1', placeholder: '1' },
];

function clamp(raw: unknown, fallback: number, min: number, max: number): number {
  const n = parseInt(String(raw ?? ''), 10);
  if (Number.isNaN(n)) return Math.min(Math.max(fallback, min), max);
  return Math.min(Math.max(n, min), max);
}

function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toAlphanumeric(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  return out;
}

function makeToken(format: string, nBytes: number): string {
  const bytes = randomBytes(nBytes);
  if (format === 'base64url') return toBase64Url(bytes);
  if (format === 'alphanumeric') return toAlphanumeric(bytes);
  return toHex(bytes);
}

export function buildToken(options: ToolOptions): string {
  const format = String(options.format ?? 'hex');
  const nBytes = clamp(options.bytes, 32, 1, 256);
  const count = clamp(options.count, 1, 1, 100);
  return Array.from({ length: count }, () => makeToken(format, nBytes)).join('\n');
}
