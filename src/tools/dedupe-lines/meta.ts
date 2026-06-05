import { ListFilter } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'dedupe-lines',
  title: 'Deduplicate Lines',
  description: 'Removes duplicate lines, keeping the first occurrence.',
  category: 'text',
  keywords: ['dedupe', 'duplicate', 'unique', 'lines', 'distinct'],
  icon: ListFilter,
  load: () => import('./index'),
};
