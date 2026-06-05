import { Regex } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'regex-tester',
  title: 'Regex Tester',
  description: 'Tests a regular expression against text and lists matches & groups.',
  category: 'regex',
  keywords: ['regex', 'regexp', 'test', 'match', 'pattern', 'groups'],
  icon: Regex,
  load: () => import('./index'),
};
