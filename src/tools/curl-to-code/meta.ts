import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'curl-to-code',
  title: 'cURL to Code',
  description: 'Converts a curl command to fetch or axios code.',
  category: 'web',
  keywords: ['curl', 'fetch', 'axios', 'code', 'convert', 'http'],
  icon: Globe,
  load: () => import('./index'),
};
