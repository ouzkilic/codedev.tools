import { GitCompare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'image-diff',
  title: 'Image Diff',
  description: 'Compares two images pixel by pixel.',
  category: 'image',
  keywords: ['image', 'diff', 'compare', 'pixel', 'difference'],
  icon: GitCompare,
  load: () => import('./index'),
};
