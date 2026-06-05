import type { ToolLogic } from '@/hooks/useToolState';

const TABLE: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new Error('Enter an integer between 1 and 3999.');
  }
  let out = '';
  for (const [value, symbol] of TABLE) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
}

function fromRoman(s: string): string {
  const roman = s.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(roman)) throw new Error('Invalid Roman numeral.');
  let i = 0;
  let total = 0;
  for (const [value, symbol] of TABLE) {
    while (roman.startsWith(symbol, i)) {
      total += value;
      i += symbol.length;
    }
  }
  if (i !== roman.length || toRoman(total) !== roman) {
    throw new Error('Invalid Roman numeral.');
  }
  return String(total);
}

export const romanLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'to-roman',
      choices: [
        { value: 'to-roman', label: 'Number → Roman' },
        { value: 'to-number', label: 'Roman → Number' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'to-roman') === 'to-number'
      ? fromRoman(input)
      : toRoman(Number(input.trim()));
  },
};
