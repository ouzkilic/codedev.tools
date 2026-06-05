import type { ToolLogic } from '@/hooks/useToolState';

// Matches any non-ASCII code unit (>= U+0080); ASCII control chars are left alone.
const NON_ASCII = new RegExp('[\\u0080-\\uffff]', 'g');

function escape(input: string): string {
  return input.replace(NON_ASCII, (c) =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  );
}

function unescape(input: string): string {
  return input
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)));
}

export const unicodeEscapeLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'escape',
      choices: [
        { value: 'escape', label: 'Escape (→ \\uXXXX)' },
        { value: 'unescape', label: 'Unescape' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'escape') === 'unescape' ? unescape(input) : escape(input);
  },
};
