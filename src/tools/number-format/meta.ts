import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'number-format',
  title: 'Number Formatter',
  description: 'Adds thousands separators to a number.',
  category: 'number',
  keywords: ['number', 'format', 'thousands', 'separator', 'group'],
  icon: Hash,
  load: () => import('./index'),
};
