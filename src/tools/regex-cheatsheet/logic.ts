import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const REGEX_OPTIONS: ToolOption[] = [
  { key: 'filter', label: 'Search', type: 'text', default: '', placeholder: 'Filter tokens...' },
];

const LINES: string[] = [
  '\\d  digit',
  '\\D  non-digit',
  '\\w  word char',
  '\\W  non-word',
  '\\s  whitespace',
  '\\S  non-whitespace',
  '.  any char',
  '^  start of string',
  '$  end of string',
  '*  0 or more',
  '+  1 or more',
  '?  0 or 1',
  '{n}  exactly n',
  '{n,}  n or more',
  '{n,m}  n to m',
  '[abc]  set',
  '[^abc]  negated set',
  '[a-z]  range',
  '(...)  group',
  '(?:...)  non-capturing',
  '(?<name>...)  named group',
  'a|b  alternation',
  '\\b  word boundary',
  '\\B  non-word boundary',
  '(?=...)  lookahead',
  '(?!...)  negative lookahead',
  '(?<=...)  lookbehind',
  '(?<!...)  negative lookbehind',
  '\\n  newline',
  '\\t  tab',
];

export function buildRegex(options: ToolOptions): string {
  const q = String(options.filter ?? '').trim().toLowerCase();
  if (!q) return LINES.join('\n');
  return LINES.filter((line) => line.toLowerCase().includes(q)).join('\n');
}
