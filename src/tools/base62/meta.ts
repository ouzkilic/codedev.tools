import { Binary } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base62',
  title: 'Base62 Encode / Decode',
  description: 'Encodes and decodes Base62 (0-9A-Za-z).',
  category: 'encode',
  keywords: ['base62', 'encode', 'decode', 'alphanumeric'],
  icon: Binary,
  load: () => import('./index'),
};
