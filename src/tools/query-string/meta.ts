import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'query-string',
  title: 'Query String ↔ JSON',
  description: 'Parses a URL query string to JSON, or builds one from JSON.',
  category: 'web',
  keywords: ['query', 'querystring', 'url', 'params', 'json', 'search'],
  icon: Globe,
  load: () => import('./index'),
};
