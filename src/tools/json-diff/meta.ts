import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-diff',
  title: 'JSON Diff',
  description: 'Compares two JSON documents, ignoring key order and formatting.',
  category: 'compare',
  keywords: ['json', 'diff', 'compare', 'difference', 'structural'],
  icon: GitCompare,
  load: () => import('./index'),
};
