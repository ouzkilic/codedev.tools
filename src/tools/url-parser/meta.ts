import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'url-parser',
  title: 'URL Parser',
  description: 'Breaks a URL into its protocol, host, path, query and hash.',
  category: 'web',
  keywords: ['url', 'parse', 'components', 'query', 'host', 'path'],
  icon: Globe,
  load: () => import('./index'),
};
