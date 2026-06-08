import type { ToolLogic } from '@/hooks/useToolState';

const encodeMap: Record<string, string> = {
  a: '4',
  e: '3',
  i: '1',
  o: '0',
  s: '5',
  t: '7',
};

const decodeMap: Record<string, string> = {
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '0': 'o',
  '5': 's',
  '7': 't',
};

function encode(input: string): string {
  let result = '';
  for (const char of input) {
    const lower = char.toLowerCase();
    result += encodeMap[lower] ?? char;
  }
  return result;
}

function decode(input: string): string {
  let result = '';
  for (const char of input) {
    result += decodeMap[char] ?? char;
  }
  return result;
}

export const leetspeakLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
      default: 'encode',
    },
  ],
  transform(input, ctx): string {
    const mode = String(ctx?.options.mode ?? 'encode');
    return mode === 'decode' ? decode(input) : encode(input);
  },
};
