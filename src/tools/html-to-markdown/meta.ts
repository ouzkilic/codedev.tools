import { BookText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-to-markdown',
  title: 'HTML → Markdown',
  description: 'Converts HTML into Markdown.',
  category: 'markdown',
  keywords: ['html', 'markdown', 'md', 'convert', 'turndown'],
  icon: BookText,
  load: () => import('./index'),
};
