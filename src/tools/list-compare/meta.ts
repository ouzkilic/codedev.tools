import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'list-compare',
  title: 'List Compare',
  description: 'Set operations on two lists: intersection, union, difference.',
  category: 'compare',
  keywords: ['list', 'compare', 'set', 'intersection', 'union', 'difference', 'diff'],
  icon: GitCompare,
  load: () => import('./index'),
};
