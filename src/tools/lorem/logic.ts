import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
  'exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
  'in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint ' +
  'occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

export const LOREM_OPTIONS: ToolOption[] = [
  {
    key: 'unit',
    label: 'Unit',
    type: 'select',
    default: 'paragraphs',
    choices: [
      { value: 'words', label: 'Words' },
      { value: 'sentences', label: 'Sentences' },
      { value: 'paragraphs', label: 'Paragraphs' },
    ],
  },
  { key: 'count', label: 'Count', type: 'text', default: '3', placeholder: '3' },
];

function clamp(raw: unknown, fallback: number, max: number): number {
  const n = parseInt(String(raw ?? ''), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, 1), max);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const rand = (n: number) => Math.floor(Math.random() * n);
const pick = () => WORDS[rand(WORDS.length)];

function sentence(): string {
  const length = 6 + rand(8); // 6–13 words
  const words = Array.from({ length }, pick);
  return cap(words.join(' ')) + '.';
}

function paragraph(): string {
  const length = 3 + rand(4); // 3–6 sentences
  return Array.from({ length }, sentence).join(' ');
}

export function generateLorem(options: ToolOptions): string {
  const unit = String(options.unit ?? 'paragraphs');
  const count = clamp(options.count, 3, 1000);

  if (unit === 'words') return cap(Array.from({ length: count }, pick).join(' '));
  if (unit === 'sentences') return Array.from({ length: count }, sentence).join(' ');
  return Array.from({ length: count }, paragraph).join('\n\n');
}
