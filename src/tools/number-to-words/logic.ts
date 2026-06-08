import type { ToolLogic } from '@/hooks/useToolState';

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = ['', 'thousand', 'million', 'billion'];

function threeDigits(n: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} hundred`);
  }
  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest]);
    } else {
      const t = Math.floor(rest / 10);
      const o = rest % 10;
      parts.push(o > 0 ? `${TENS[t]}-${ONES[o]}` : TENS[t]);
    }
  }
  return parts.join(' ');
}

export const numberToWordsLogic: ToolLogic = {
  transform(input: string): string {
    const trimmed = input.trim();
    if (trimmed === '') return '';
    if (!/^-?\d+$/.test(trimmed)) {
      throw new Error('Input must be a valid integer');
    }
    const num = Number(trimmed);
    if (!Number.isInteger(num)) {
      throw new Error('Input must be a valid integer');
    }
    const abs = Math.abs(num);
    if (abs > 999999999999) {
      throw new Error('Number out of range (0..999,999,999,999)');
    }
    if (abs === 0) return 'zero';

    const groups: number[] = [];
    let remaining = abs;
    while (remaining > 0) {
      groups.push(remaining % 1000);
      remaining = Math.floor(remaining / 1000);
    }

    const words: string[] = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g === 0) continue;
      const chunk = threeDigits(g);
      words.push(SCALES[i] ? `${chunk} ${SCALES[i]}` : chunk);
    }

    const result = words.join(' ');
    return num < 0 ? `negative ${result}` : result;
  },
};
