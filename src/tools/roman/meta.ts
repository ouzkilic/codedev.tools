import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'roman',
  title: 'Roman Numerals',
  description: 'Converts between numbers and Roman numerals (1–3999).',
  category: 'number',
  keywords: ['roman', 'numeral', 'number', 'convert', 'mmxxiv'],
  icon: Hash,
  load: () => import('./index'),
};
