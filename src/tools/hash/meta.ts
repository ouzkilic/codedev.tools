import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'hash',
  title: 'Hash (SHA)',
  description: 'Computes SHA-1, SHA-256, SHA-384 or SHA-512 of text.',
  category: 'crypto',
  keywords: ['hash', 'sha', 'sha256', 'sha512', 'sha1', 'digest', 'checksum'],
  icon: Hash,
  load: () => import('./index'),
};
