import { AlignLeft } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'text-stats',
  title: 'Text Statistics',
  description: 'Counts characters, words, lines and UTF-8 bytes.',
  category: 'text',
  keywords: ['count', 'words', 'characters', 'lines', 'bytes', 'length', 'stats'],
  icon: AlignLeft,
  load: () => import('./index'),
};
