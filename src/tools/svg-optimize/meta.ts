import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'svg-optimize',
  title: 'SVG Optimizer',
  description: 'Minifies SVG (removes comments, declarations, whitespace).',
  category: 'web',
  keywords: ['svg', 'optimize', 'minify', 'compress'],
  icon: Code2,
  load: () => import('./index'),
};
