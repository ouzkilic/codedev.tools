import type { ToolLogic } from '@/hooks/useToolState';

// Alternation (not a character class) to avoid combining-mark lint issues with ZWJ.
const INVISIBLE_RE = new RegExp(
  '\\u200b|\\u200c|\\u200d|\\u200e|\\u200f|\\ufeff|\\u00ad|\\u2060',
  'g',
);

export const invisibleCharsLogic: ToolLogic = {
  transform(input: string): string {
    return input.replace(INVISIBLE_RE, '');
  },
};
