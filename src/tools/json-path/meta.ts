import { Search } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-path',
  title: 'JSONPath Evaluator',
  description: 'Queries JSON with a JSONPath expression and shows the matches.',
  category: 'json',
  keywords: ['json', 'jsonpath', 'query', 'path', 'filter', 'select'],
  icon: Search,
  load: () => import('./index'),
};
