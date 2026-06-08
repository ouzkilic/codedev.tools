import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'svg-to-jsx',
  title: 'SVG to JSX / Data URI',
  description: 'Converts SVG to JSX-safe markup or a data URI.',
  category: 'web',
  keywords: ['svg', 'jsx', 'react', 'data uri', 'convert'],
  icon: Globe,
  load: () => import('./index'),
};
