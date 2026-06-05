import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'whitespace',
  title: 'Whitespace Cleaner',
  description: 'Trims lines, collapses spaces and removes empty lines.',
  category: 'text',
  keywords: ['whitespace', 'trim', 'spaces', 'empty', 'lines', 'clean'],
  icon: Type,
  load: () => import('./index'),
};
