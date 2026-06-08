import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-diff',
  title: 'HTML Diff',
  description: 'Compares two HTML snippets, ignoring inter-tag whitespace.',
  category: 'compare',
  keywords: ['html', 'diff', 'compare', 'difference'],
  icon: GitCompare,
  load: () => import('./index'),
};
