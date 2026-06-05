import { ArrowUpDown } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'sort-lines',
  title: 'Sort Lines',
  description: 'Sorts lines alphabetically, numerically or by length.',
  category: 'text',
  keywords: ['sort', 'lines', 'order', 'alphabetical', 'numeric'],
  icon: ArrowUpDown,
  load: () => import('./index'),
};
