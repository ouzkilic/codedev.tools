import type { ToolLogic } from '@/hooks/useToolState';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let out = '';
  while (num > 0n) {
    out = ALPHABET[Number(num % 62n)] + out;
    num /= 62n;
  }
  return '0'.repeat(zeros) + out;
}

function decode(input: string): string {
  const str = input.trim();
  let zeros = 0;
  while (zeros < str.length && str[zeros] === '0') zeros++;
  let num = 0n;
  for (const c of str) {
    const i = ALPHABET.indexOf(c);
    if (i < 0) throw new Error(`Invalid Base62 character: '${c}'.`);
    num = num * 62n + BigInt(i);
  }
  const tail: number[] = [];
  while (num > 0n) {
    tail.unshift(Number(num % 256n));
    num /= 256n;
  }
  const bytes = new Uint8Array(zeros + tail.length);
  bytes.set(tail, zeros);
  return new TextDecoder().decode(bytes);
}

export const base62Logic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'encode') === 'decode' ? decode(input) : encode(input);
  },
};
