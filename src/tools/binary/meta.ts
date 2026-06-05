import { Binary } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'binary',
  title: 'Binary ↔ Text',
  description: 'Converts text to 8-bit binary and back (UTF-8).',
  category: 'encode',
  keywords: ['binary', 'bits', 'text', 'encode', 'decode', 'bytes'],
  icon: Binary,
  load: () => import('./index'),
};
