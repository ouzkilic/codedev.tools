import type { ToolLogic } from '@/hooks/useToolState';

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(input: string): number {
  const bytes = new TextEncoder().encode(input);
  let crc = 0xffffffff;
  for (const b of bytes) crc = (crc >>> 8) ^ TABLE[(crc ^ b) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

export const crc32Logic: ToolLogic = {
  transform(input: string): string {
    const value = crc32(input);
    return [
      `Hex:      ${value.toString(16).padStart(8, '0')}`,
      `Decimal:  ${value}`,
    ].join('\n');
  },
};
