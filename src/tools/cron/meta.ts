import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cron',
  title: 'Cron Explainer',
  description: 'Explains a cron expression in plain English.',
  category: 'datetime',
  keywords: ['cron', 'crontab', 'schedule', 'explain', 'expression'],
  icon: Clock,
  load: () => import('./index'),
};
