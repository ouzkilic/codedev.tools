import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'find-replace',
  title: 'Find & Replace',
  description: 'Finds and replaces text, with regex and case options.',
  category: 'text',
  keywords: ['find', 'replace', 'substitute', 'regex', 'search'],
  icon: Type,
  load: () => import('./index'),
};
