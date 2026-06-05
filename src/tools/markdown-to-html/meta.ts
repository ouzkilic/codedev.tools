import { BookText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'markdown-to-html',
  title: 'Markdown → HTML',
  description: 'Converts Markdown into HTML.',
  category: 'markdown',
  keywords: ['markdown', 'md', 'html', 'convert', 'render'],
  icon: BookText,
  load: () => import('./index'),
};
