import type { ToolLogic } from '@/hooks/useToolState';

function textToHex(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToText(input: string): string {
  const clean = input.replace(/\s+/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of digits.');
  }
  if (!/^[0-9a-fA-F]*$/.test(clean)) {
    throw new Error('Input contains non-hex characters.');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export const hexLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode (text → hex)' },
        { value: 'decode', label: 'Decode (hex → text)' },
      ],
    },
  ],
  transform(input: string, ctx): string {
    return (ctx?.options.mode ?? 'encode') === 'decode' ? hexToText(input) : textToHex(input);
  },
};
