import type { ToolLogic } from '@/hooks/useToolState';

export const hashIdLogic: ToolLogic = {
  transform(input) {
    const h = input.trim();
    if (!h) return '';
    if (/^\$2[aby]?\$/.test(h)) return 'Possible: bcrypt';
    if (/^\$argon2/.test(h)) return 'Possible: Argon2';
    if (!/^[0-9a-fA-F]+$/.test(h)) return 'Unknown (non-hex / unrecognized).';
    const map: Record<number, string> = {
      8: 'CRC32 / Adler-32',
      32: 'MD5 / MD4 / NTLM',
      40: 'SHA-1 / RIPEMD-160',
      56: 'SHA-224',
      64: 'SHA-256 / SHA3-256',
      96: 'SHA-384',
      128: 'SHA-512 / SHA3-512',
    };
    return 'Possible: ' + (map[h.length] ?? `unknown (${h.length} hex chars)`);
  },
};
