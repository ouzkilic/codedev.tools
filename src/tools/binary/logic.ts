import type { ToolLogic } from '@/hooks/useToolState';

function textToBinary(input: string): string {
  return Array.from(new TextEncoder().encode(input))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

function binaryToText(input: string): string {
  const groups = input.trim().split(/\s+/).filter(Boolean);
  const bytes = new Uint8Array(groups.length);
  groups.forEach((g, i) => {
    if (!/^[01]{1,8}$/.test(g)) throw new Error(`Invalid binary byte: '${g}'.`);
    bytes[i] = parseInt(g, 2);
  });
  return new TextDecoder().decode(bytes);
}

export const binaryLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode (text → binary)' },
        { value: 'decode', label: 'Decode (binary → text)' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'encode') === 'decode' ? binaryToText(input) : textToBinary(input);
  },
};
