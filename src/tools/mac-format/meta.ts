import { Network } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'mac-format',
  title: 'MAC Address Formatter',
  description: 'Reformats a MAC address (colon, hyphen, dot).',
  category: 'network',
  keywords: ['mac', 'address', 'format', 'network', 'ethernet'],
  icon: Network,
  load: () => import('./index'),
};
