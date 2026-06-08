import { BookText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'markdown-preview',
  title: 'Markdown Preview',
  description: 'Live preview of rendered Markdown (sanitized).',
  category: 'markdown',
  keywords: ['markdown', 'md', 'preview', 'render', 'live'],
  icon: BookText,
  load: () => import('./index'),
};
