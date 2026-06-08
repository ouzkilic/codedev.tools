import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-to-jsx',
  title: 'HTML → JSX',
  description: 'Converts HTML attributes/syntax to JSX.',
  category: 'web',
  keywords: ['html', 'jsx', 'react', 'convert', 'className'],
  icon: Globe,
  load: () => import('./index'),
};
