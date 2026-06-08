import type { ToolLogic } from '@/hooks/useToolState';

function encode(input: string): string {
  return [...input].map((c) => c.codePointAt(0)).join(' ');
}

function decode(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => {
      const code = parseInt(n, 10);
      if (Number.isNaN(code)) throw new Error('Invalid code: ' + n);
      return String.fromCodePoint(code);
    })
    .join('');
}

export const charcodeLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode (text → codes)' },
        { value: 'decode', label: 'Decode (codes → text)' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'encode') === 'decode' ? decode(input) : encode(input);
  },
};
