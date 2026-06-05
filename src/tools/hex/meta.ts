import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'hex',
  title: 'Hex ↔ Text',
  description: 'Converts text to hexadecimal bytes or hex back to text (UTF-8).',
  category: 'encode',
  keywords: ['hex', 'hexadecimal', 'text', 'bytes', 'encode', 'decode'],
  icon: Hash,
  load: () => import('./index'),
};
