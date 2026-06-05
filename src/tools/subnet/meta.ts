import { Network } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'subnet',
  title: 'Subnet Calculator',
  description: 'Computes network, broadcast, mask and host range from CIDR.',
  category: 'network',
  keywords: ['subnet', 'cidr', 'ip', 'netmask', 'network', 'ipv4'],
  icon: Network,
  load: () => import('./index'),
};
