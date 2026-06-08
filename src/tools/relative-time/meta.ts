import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'relative-time',
  title: 'Relative Time',
  description: 'Shows how long ago or until a date is.',
  category: 'datetime',
  keywords: ['relative', 'time', 'ago', 'until', 'date', 'humanize'],
  icon: Clock,
  load: () => import('./index'),
};
