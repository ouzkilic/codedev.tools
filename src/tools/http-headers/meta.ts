import { Network } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'http-headers',
  title: 'HTTP Header Parser',
  description: 'Parses raw HTTP headers into JSON.',
  category: 'network',
  keywords: ['http', 'headers', 'parse', 'request', 'response'],
  icon: Network,
  load: () => import('./index'),
};
