import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base-convert',
  title: 'Number Base Converter',
  description: 'Converts numbers between binary, octal, decimal and hex.',
  category: 'number',
  keywords: ['base', 'binary', 'octal', 'decimal', 'hex', 'radix', 'convert'],
  icon: Hash,
  load: () => import('./index'),
};
