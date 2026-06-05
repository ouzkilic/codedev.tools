import type { ToolLogic } from '@/hooks/useToolState';

function parseInBase(str: string, base: number): bigint {
  if (str.length === 0) throw new Error('Enter a number.');
  const B = BigInt(base);
  let value = 0n;
  for (const ch of str.toLowerCase()) {
    const digit = parseInt(ch, base);
    if (Number.isNaN(digit)) throw new Error(`Invalid digit '${ch}' for base ${base}.`);
    value = value * B + BigInt(digit);
  }
  return value;
}

function detect(raw: string): { str: string; base: number } {
  const s = raw.trim().toLowerCase();
  if (s.startsWith('0x')) return { str: s.slice(2), base: 16 };
  if (s.startsWith('0b')) return { str: s.slice(2), base: 2 };
  if (s.startsWith('0o')) return { str: s.slice(2), base: 8 };
  return { str: s, base: 10 };
}

export const baseConvertLogic: ToolLogic = {
  options: [
    {
      key: 'from',
      label: 'From',
      type: 'select',
      default: 'auto',
      choices: [
        { value: 'auto', label: 'Auto-detect' },
        { value: '2', label: 'Binary' },
        { value: '8', label: 'Octal' },
        { value: '10', label: 'Decimal' },
        { value: '16', label: 'Hex' },
      ],
    },
  ],
  transform(input, ctx) {
    const from = String(ctx?.options.from ?? 'auto');
    const { str, base } = from === 'auto' ? detect(input) : { str: input.trim().toLowerCase(), base: Number(from) };
    const value = parseInBase(str, base);
    return [
      `Decimal:  ${value.toString(10)}`,
      `Hex:      ${value.toString(16)}`,
      `Octal:    ${value.toString(8)}`,
      `Binary:   ${value.toString(2)}`,
    ].join('\n');
  },
};
