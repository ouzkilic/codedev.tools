import type { ToolLogic } from '@/hooks/useToolState';

function clampWidth(raw: string): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) {
    return 0;
  }
  return Math.min(Math.max(n, 0), 1000);
}

function processLine(
  line: string,
  width: number,
  char: string,
  side: string,
  mode: string,
): string {
  let result = line;
  if (mode === 'truncate' || mode === 'both') {
    result = result.slice(0, width);
  }
  if (mode === 'pad' || mode === 'both') {
    result =
      side === 'start'
        ? result.padStart(width, char)
        : result.padEnd(width, char);
  }
  return result;
}

export const padTruncateLogic: ToolLogic = {
  options: [
    { key: 'width', label: 'Width', type: 'text', placeholder: '10', default: '10' },
    { key: 'char', label: 'Pad char', type: 'text', placeholder: ' ', default: ' ' },
    {
      key: 'side',
      label: 'Side',
      type: 'select',
      choices: [
        { value: 'start', label: 'Start' },
        { value: 'end', label: 'End' },
      ],
      default: 'end',
    },
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'pad', label: 'Pad' },
        { value: 'truncate', label: 'Truncate' },
        { value: 'both', label: 'Both' },
      ],
      default: 'pad',
    },
  ],
  transform(input: string, ctx): string {
    const width = clampWidth(String(ctx?.options.width ?? '10'));
    const rawChar = String(ctx?.options.char ?? ' ');
    const char = rawChar.length > 0 ? rawChar[0] : ' ';
    const side = String(ctx?.options.side ?? 'end');
    const mode = String(ctx?.options.mode ?? 'pad');

    return input
      .split('\n')
      .map((line) => processLine(line, width, char, side, mode))
      .join('\n');
  },
};
