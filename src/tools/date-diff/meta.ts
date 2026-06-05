import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'date-diff',
  title: 'Date Difference',
  description: 'Calculates the duration between two dates.',
  category: 'datetime',
  keywords: ['date', 'diff', 'difference', 'duration', 'between', 'days'],
  icon: Clock,
  load: () => import('./index'),
};
