import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'pbkdf2',
  title: 'PBKDF2',
  description: 'Derives a key from a password with PBKDF2 (Web Crypto).',
  category: 'crypto',
  keywords: ['pbkdf2', 'kdf', 'derive', 'key', 'password', 'crypto'],
  icon: Hash,
  load: () => import('./index'),
};
