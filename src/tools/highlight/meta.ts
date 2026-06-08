import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'highlight',
  title: 'Syntax Highlighter',
  description: 'Highlights code as HTML using highlight.js.',
  category: 'format',
  keywords: ['syntax', 'highlight', 'code', 'html', 'hljs'],
  icon: Code2,
  load: () => import('./index'),
};
