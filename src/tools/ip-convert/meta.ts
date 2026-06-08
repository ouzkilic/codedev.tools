import { Network } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ip-convert',
  title: 'IP ↔ Integer',
  description: 'Converts an IPv4 address to/from its integer form.',
  category: 'network',
  keywords: ['ip', 'ipv4', 'integer', 'convert', 'network'],
  icon: Network,
  load: () => import('./index'),
};
