import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cron-next',
  title: 'Cron Next Runs',
  description: 'Shows the next scheduled run times for a cron expression.',
  category: 'datetime',
  keywords: ['cron', 'next', 'schedule', 'runs', 'crontab'],
  icon: Clock,
  load: () => import('./index'),
};
