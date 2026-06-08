import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'text-repeat',
  title: 'Text Repeater',
  description: 'Repeats the input text a number of times.',
  category: 'text',
  keywords: ['repeat', 'duplicate', 'multiply', 'text'],
  icon: Type,
  load: () => import('./index'),
};
