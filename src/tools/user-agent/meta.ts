import { Network } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'user-agent',
  title: 'User-Agent Parser',
  description: 'Parses a User-Agent string into browser, OS and device.',
  category: 'network',
  keywords: ['user-agent', 'ua', 'browser', 'os', 'device', 'parse'],
  icon: Network,
  load: () => import('./index'),
};
