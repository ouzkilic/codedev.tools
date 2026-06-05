import type { ToolLogic } from '@/hooks/useToolState';

export const jsonEscapeLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'escape',
      choices: [
        { value: 'escape', label: 'Escape (text → JSON string)' },
        { value: 'unescape', label: 'Unescape (JSON string → text)' },
      ],
    },
  ],
  transform(input: string, ctx): string {
    const mode = ctx?.options.mode ?? 'escape';
    if (mode === 'unescape') {
      const parsed = JSON.parse(input);
      if (typeof parsed !== 'string') {
        throw new Error('Input must be a JSON string literal wrapped in double quotes.');
      }
      return parsed;
    }
    // escape: wrap raw text as a JSON string literal.
    return JSON.stringify(input);
  },
};
