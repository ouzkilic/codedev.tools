import { Globe } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'http-status',
  title: 'HTTP Status Codes',
  description: 'Looks up HTTP status codes by number or description.',
  category: 'misc',
  keywords: ['http', 'status', 'code', '404', '500', 'reference'],
  icon: Globe,
  load: () => import('./index'),
};
