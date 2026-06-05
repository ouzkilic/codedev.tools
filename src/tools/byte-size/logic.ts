import type { ToolLogic } from '@/hooks/useToolState';

const MULT: Record<string, number> = {
  b: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12,
  kib: 1024, mib: 1024 ** 2, gib: 1024 ** 3, tib: 1024 ** 4,
};

function parseToBytes(input: string): number {
  const m = input.trim().toLowerCase().match(/^([\d.]+)\s*(b|kb|mb|gb|tb|kib|mib|gib|tib)?$/);
  if (!m) throw new Error('Enter a byte count or a size like "1.5 MB".');
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) throw new Error('Invalid number.');
  return n * MULT[m[2] ?? 'b'];
}

function humanize(bytes: number, base: number, units: string[]): string {
  if (bytes < base) return `${bytes} ${units[0]}`;
  let i = 0;
  let v = bytes;
  while (v >= base && i < units.length - 1) {
    v /= base;
    i++;
  }
  return `${parseFloat(v.toFixed(2))} ${units[i]}`;
}

export const byteSizeLogic: ToolLogic = {
  transform(input: string): string {
    const bytes = parseToBytes(input);
    return [
      `Bytes:    ${bytes}`,
      `Decimal:  ${humanize(bytes, 1000, ['B', 'KB', 'MB', 'GB', 'TB', 'PB'])}`,
      `Binary:   ${humanize(bytes, 1024, ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'])}`,
    ].join('\n');
  },
};
