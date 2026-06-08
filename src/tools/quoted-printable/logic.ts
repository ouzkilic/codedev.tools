import type { ToolLogic } from '@/hooks/useToolState';

function encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let out = '';
  for (const b of bytes) {
    if ((b >= 33 && b <= 126 && b !== 61) || b === 32 || b === 9) {
      out += String.fromCharCode(b);
    } else {
      out += '=' + b.toString(16).toUpperCase().padStart(2, '0');
    }
  }
  return out;
}

function decode(input: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '=') {
      const hex = input.slice(i + 1, i + 3);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 2;
      } else if (input[i + 1] === '\n' || input.slice(i + 1, i + 3) === '\r\n') {
        // soft line break — skip
        i += input[i + 1] === '\r' ? 2 : 1;
      } else {
        bytes.push(61);
      }
    } else {
      bytes.push(input.charCodeAt(i));
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export const quotedPrintableLogic: ToolLogic = {
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
