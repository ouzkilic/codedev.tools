import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'xpath',
  title: 'XPath Tester',
  description: 'Evaluates an XPath expression against XML.',
  category: 'xml',
  keywords: ['xpath', 'xml', 'query', 'select', 'test'],
  icon: Code2,
  load: () => import('./index'),
};
