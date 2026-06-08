import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'number-to-words', title: 'Number to Words', description: 'Converts an integer into English words.', category: 'number',
  keywords: ['number', 'words', 'english', 'spell', 'convert'], icon: Hash, load: () => import('./index'),
};
