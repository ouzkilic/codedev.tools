import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'crontab-cheatsheet',
  title: 'Crontab Cheatsheet',
  description: 'Cron syntax reference and common examples.',
  category: 'datetime',
  keywords: ['cron', 'crontab', 'schedule', 'cheatsheet', 'reference'],
  icon: Clock,
  load: () => import('./index'),
};
