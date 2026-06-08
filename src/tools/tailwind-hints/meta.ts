import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'tailwind-hints',
  title: 'Tailwind → CSS',
  description: 'Searchable Tailwind class to CSS reference.',
  category: 'web',
  keywords: ['tailwind', 'css', 'class', 'reference', 'utility'],
  icon: Globe,
  load: () => import('./index'),
};
