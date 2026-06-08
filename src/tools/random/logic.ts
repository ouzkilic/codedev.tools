import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

const HEX_CHARS = '0123456789abcdef';
const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const RANDOM_OPTIONS: ToolOption[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    choices: [
      { value: 'integer', label: 'Integer' },
      { value: 'float', label: 'Float' },
      { value: 'hex', label: 'Hex' },
      { value: 'alphanumeric', label: 'Alphanumeric' },
    ],
    default: 'integer',
  },
  { key: 'min', label: 'Min', type: 'text', default: '1', placeholder: '1' },
  { key: 'max', label: 'Max', type: 'text', default: '100', placeholder: '100' },
  { key: 'length', label: 'Length', type: 'text', default: '16', placeholder: '16' },
  { key: 'count', label: 'Count', type: 'text', default: '5', placeholder: '5' },
];

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

/** A uniform float in [0, 1) sourced from a crypto Uint32. */
export function randomUnit(): number {
  const buf = crypto.getRandomValues(new Uint32Array(1));
  return buf[0] / 0x100000000;
}

/** A uniform integer in [min, max] inclusive. */
export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  const span = hi - lo + 1;
  return lo + Math.floor(randomUnit() * span);
}

export function randomFloat(min: number, max: number): number {
  return min + randomUnit() * (max - min);
}

export function randomFromAlphabet(length: number, alphabet: string): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(randomUnit() * alphabet.length)];
  }
  return out;
}

export function buildRandom(options: ToolOptions): string {
  const type = String(options.type ?? 'integer');
  const min = Number(String(options.min ?? '1')) || 0;
  const max = Number(String(options.max ?? '100')) || 0;
  const length = clamp(parseInt(String(options.length ?? '16'), 10) || 16, 1, 4096);
  const count = clamp(parseInt(String(options.count ?? '5'), 10) || 5, 1, 1000);

  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'float':
        lines.push(randomFloat(min, max).toFixed(4));
        break;
      case 'hex':
        lines.push(randomFromAlphabet(length, HEX_CHARS));
        break;
      case 'alphanumeric':
        lines.push(randomFromAlphabet(length, ALPHANUM));
        break;
      case 'integer':
      default:
        lines.push(String(randomInt(min, max)));
        break;
    }
  }
  return lines.join('\n');
}
