import { Regex } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'regex-cheatsheet',
  title: 'Regex Cheatsheet',
  description: 'Common regular expression tokens reference.',
  category: 'regex',
  keywords: ['regex', 'cheatsheet', 'reference', 'pattern', 'tokens'],
  icon: Regex,
  load: () => import('./index'),
};
