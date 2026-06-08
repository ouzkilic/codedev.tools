import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-diff',
  title: 'CSV Diff',
  description: 'Compares two CSV documents.',
  category: 'compare',
  keywords: ['csv', 'diff', 'compare', 'difference'],
  icon: GitCompare,
  load: () => import('./index'),
};
