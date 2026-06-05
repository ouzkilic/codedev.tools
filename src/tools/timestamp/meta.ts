import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'timestamp',
  title: 'Unix Timestamp Converter',
  description: 'Converts between Unix timestamps and human-readable dates.',
  category: 'datetime',
  keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'iso'],
  icon: Clock,
  load: () => import('./index'),
};
