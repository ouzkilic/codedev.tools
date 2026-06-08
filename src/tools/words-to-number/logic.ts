import type { ToolLogic } from '@/hooks/useToolState';

const SMALL: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALES: Record<string, number> = {
  thousand: 1000,
  million: 1000000,
  billion: 1000000000,
};

function parseWords(text: string): number {
  let negative = false;
  const tokens = text
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\band\b/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) throw new Error('Empty input');

  if (tokens[0] === 'negative' || tokens[0] === 'minus') {
    negative = true;
    tokens.shift();
  }

  if (tokens.length === 0) throw new Error('No number words found');

  let total = 0;
  let current = 0;
  let sawWord = false;

  for (const token of tokens) {
    if (token in SMALL) {
      current += SMALL[token];
      sawWord = true;
    } else if (token in TENS) {
      current += TENS[token];
      sawWord = true;
    } else if (token === 'hundred') {
      current = (current === 0 ? 1 : current) * 100;
      sawWord = true;
    } else if (token in SCALES) {
      current = (current === 0 ? 1 : current) * SCALES[token];
      total += current;
      current = 0;
      sawWord = true;
    } else {
      throw new Error(`Unrecognized word: ${token}`);
    }
  }

  if (!sawWord) throw new Error('No number words found');

  const result = total + current;
  return negative ? -result : result;
}

export const wordsToNumberLogic: ToolLogic = {
  transform(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    try {
      return String(parseWords(trimmed));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Invalid input', { cause: e });
    }
  },
};
