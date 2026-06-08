import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const UUID_OPTIONS: ToolOption[] = [
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    default: 'v4',
    choices: [
      { value: 'v4', label: 'v4 (random)' },
      { value: 'v7', label: 'v7 (time-ordered)' },
    ],
  },
  { key: 'count', label: 'Count', type: 'text', default: '5', placeholder: '5' },
];

function clampCount(raw: ToolOptions['count']): number {
  const n = parseInt(String(raw ?? '1'), 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(Math.max(n, 1), 1000);
}

const hex: string[] = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

// UUIDv7: 48-bit big-endian timestamp (ms) + version/variant bits + random.
export function uuidV7(now: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const ts = BigInt(now);
  for (let i = 0; i < 6; i++) {
    bytes[i] = Number((ts >> BigInt(40 - 8 * i)) & 0xffn);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const b = [...bytes].map((x) => hex[x]);
  return `${b[0]}${b[1]}${b[2]}${b[3]}-${b[4]}${b[5]}-${b[6]}${b[7]}-${b[8]}${b[9]}-${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}`;
}

export function generateUuids(options: ToolOptions, now = Date.now()): string {
  const count = clampCount(options.count);
  const v7 = options.version === 'v7';
  return Array.from({ length: count }, () => (v7 ? uuidV7(now) : crypto.randomUUID())).join('\n');
}
