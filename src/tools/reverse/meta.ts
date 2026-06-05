import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'reverse',
  title: 'Reverse Text',
  description: 'Reverses text by characters, words or lines.',
  category: 'text',
  keywords: ['reverse', 'flip', 'backwards', 'text', 'lines', 'words'],
  icon: Type,
  load: () => import('./index'),
};
