import type { ToolLogic } from '@/hooks/useToolState';

// Splits arbitrary text into words, handling camelCase, snake_case, kebab and spaces.
function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const CONVERTERS: Record<string, (input: string) => string> = {
  camel: (s) => words(s).map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join(''),
  pascal: (s) => words(s).map(cap).join(''),
  snake: (s) => words(s).map((w) => w.toLowerCase()).join('_'),
  kebab: (s) => words(s).map((w) => w.toLowerCase()).join('-'),
  constant: (s) => words(s).map((w) => w.toUpperCase()).join('_'),
  title: (s) => words(s).map(cap).join(' '),
  sentence: (s) => {
    const w = words(s);
    return w.map((x, i) => (i === 0 ? cap(x) : x.toLowerCase())).join(' ');
  },
  lower: (s) => s.toLowerCase(),
  upper: (s) => s.toUpperCase(),
};

export const textCaseLogic: ToolLogic = {
  options: [
    {
      key: 'target',
      label: 'Case',
      type: 'select',
      default: 'camel',
      choices: [
        { value: 'camel', label: 'camelCase' },
        { value: 'pascal', label: 'PascalCase' },
        { value: 'snake', label: 'snake_case' },
        { value: 'kebab', label: 'kebab-case' },
        { value: 'constant', label: 'CONSTANT_CASE' },
        { value: 'title', label: 'Title Case' },
        { value: 'sentence', label: 'Sentence case' },
        { value: 'lower', label: 'lowercase' },
        { value: 'upper', label: 'UPPERCASE' },
      ],
    },
  ],
  transform(input: string, ctx): string {
    const target = String(ctx?.options.target ?? 'camel');
    return (CONVERTERS[target] ?? CONVERTERS.camel)(input);
  },
};
