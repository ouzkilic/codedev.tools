import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'prettier-format',
  title: 'Code Formatter (Prettier)',
  description: 'Formats JS, TS, JSON, CSS, HTML and Markdown with Prettier.',
  category: 'format',
  keywords: ['prettier', 'format', 'beautify', 'js', 'ts', 'css', 'html'],
  icon: Code2,
  load: () => import('./index'),
};
