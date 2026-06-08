import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'words-to-number',
  title: 'Words to Number',
  description: 'Converts English number words into an integer.',
  category: 'number',
  keywords: ['words', 'number', 'parse', 'english', 'convert'],
  icon: Hash,
  load: () => import('./index'),
};
