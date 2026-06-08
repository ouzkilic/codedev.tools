import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'duration-format',
  title: 'Duration Formatter',
  description: 'Converts between seconds and a human-readable duration.',
  category: 'datetime',
  keywords: ['duration', 'time', 'seconds', 'format', 'humanize'],
  icon: Clock,
  load: () => import('./index'),
};
