import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'text-diff',
  title: 'Text Diff',
  description: 'Compares two texts line, word or character by character.',
  category: 'compare',
  keywords: ['diff', 'compare', 'text', 'difference', 'changes'],
  icon: GitCompare,
  load: () => import('./index'),
};
