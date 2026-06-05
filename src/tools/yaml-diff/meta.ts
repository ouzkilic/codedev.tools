import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'yaml-diff',
  title: 'YAML Diff',
  description: 'Compares two YAML documents, ignoring key order.',
  category: 'compare',
  keywords: ['yaml', 'diff', 'compare', 'difference'],
  icon: GitCompare,
  load: () => import('./index'),
};
