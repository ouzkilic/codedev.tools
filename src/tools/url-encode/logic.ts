import type { ToolLogic } from '@/hooks/useToolState';

export const urlEncodeLogic: ToolLogic = {
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
  transform(input: string, ctx): string {
    // decodeURIComponent throws on malformed sequences (e.g. a lone "%").
    return (ctx?.options.mode ?? 'encode') === 'decode'
      ? decodeURIComponent(input)
      : encodeURIComponent(input);
  },
};
