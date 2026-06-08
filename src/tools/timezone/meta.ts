import { Clock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'timezone',
  title: 'Timezone Converter',
  description: 'Shows an instant in a selected timezone.',
  category: 'datetime',
  keywords: ['timezone', 'tz', 'convert', 'utc', 'time'],
  icon: Clock,
  load: () => import('./index'),
};
