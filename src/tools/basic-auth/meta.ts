import { Network } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'basic-auth',
  title: 'Basic Auth Header',
  description: 'Builds an HTTP Basic Authorization header.',
  category: 'network',
  keywords: ['basic auth', 'authorization', 'header', 'base64', 'http'],
  icon: Network,
  load: () => import('./index'),
};
