import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-minify',
  title: 'HTML Minify',
  description: 'Minifies HTML by removing comments and collapsing whitespace.',
  category: 'web',
  keywords: ['html', 'minify', 'compress', 'whitespace'],
  icon: Globe,
  load: () => import('./index'),
};
