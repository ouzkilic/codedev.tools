import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'hash-id',
  title: 'Hash Identifier',
  description: 'Guesses the hash algorithm from format and length.',
  category: 'crypto',
  keywords: ['hash', 'identify', 'detect', 'md5', 'sha', 'bcrypt'],
  icon: Hash,
  load: () => import('./index'),
};
