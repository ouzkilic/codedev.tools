import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'percentage',
  title: 'Percentage Calculator',
  description: 'Common percentage calculations between two numbers.',
  category: 'number',
  keywords: ['percentage', 'percent', 'calculator', 'ratio', 'change'],
  icon: Hash,
  load: () => import('./index'),
};
