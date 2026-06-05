import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'xml-diff',
  title: 'XML Diff',
  description: 'Compares two XML documents, ignoring formatting.',
  category: 'compare',
  keywords: ['xml', 'diff', 'compare', 'difference'],
  icon: GitCompare,
  load: () => import('./index'),
};
