import type { ToolLogic } from '@/hooks/useToolState';

function escape(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const UNESCAPE: Record<string, string> = {
  '\\\\': '\\', '\\n': '\n', '\\r': '\r', '\\t': '\t', '\\"': '"', "\\'": "'",
};

function unescape(input: string): string {
  return input.replace(/\\[\\nrt"']/g, (m) => UNESCAPE[m] ?? m);
}

export const stringEscapeLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'escape',
      choices: [
        { value: 'escape', label: 'Escape' },
        { value: 'unescape', label: 'Unescape' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'escape') === 'unescape' ? unescape(input) : escape(input);
  },
};
