import type { ToolLogic } from '@/hooks/useToolState';

const MOD_ADLER = 65521;

export function adler32(input: string): number {
  const bytes = new TextEncoder().encode(input);
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

export const adler32Logic: ToolLogic = {
  transform(input: string): string {
    const checksum = adler32(input);
    const hex = 'Hex:      ' + checksum.toString(16).padStart(8, '0');
    const dec = 'Decimal:  ' + checksum;
    return hex + '\n' + dec;
  },
};
