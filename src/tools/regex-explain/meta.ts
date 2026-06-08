import { Regex } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'regex-explain',
  title: 'Regex Explainer',
  description: 'Explains a regular expression token by token.',
  category: 'regex',
  keywords: ['regex', 'explain', 'describe', 'pattern', 'tokens'],
  icon: Regex,
  load: () => import('./index'),
};
