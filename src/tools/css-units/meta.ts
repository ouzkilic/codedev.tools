import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'css-units',
  title: 'CSS Unit Converter',
  description: 'Converts between px, rem and em for a given root font size.',
  category: 'web',
  keywords: ['css', 'px', 'rem', 'em', 'unit', 'convert', 'font'],
  icon: Globe,
  load: () => import('./index'),
};
