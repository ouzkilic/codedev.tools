import { AlignLeft } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'word-freq',
  title: 'Word Frequency',
  description: 'Counts how often each word appears, sorted by frequency.',
  category: 'text',
  keywords: ['word', 'frequency', 'count', 'occurrences', 'histogram'],
  icon: AlignLeft,
  load: () => import('./index'),
};
