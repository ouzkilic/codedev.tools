import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'date-info',
  title: 'Date Info',
  description: 'Shows weekday, ISO week, day-of-year and more for a date.',
  category: 'datetime',
  keywords: ['date', 'info', 'iso week', 'day of year', 'quarter'],
  icon: Clock,
  load: () => import('./index'),
};
