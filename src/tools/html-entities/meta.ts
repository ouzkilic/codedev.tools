import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-entities',
  title: 'HTML Entity Encode / Decode',
  description: 'Escapes text to HTML entities or decodes entities back to text.',
  category: 'encode',
  keywords: ['html', 'entity', 'entities', 'escape', 'unescape', 'encode', 'decode'],
  icon: Code2,
  load: () => import('./index'),
};
