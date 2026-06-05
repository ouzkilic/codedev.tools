import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'md5',
  title: 'MD5 Hash',
  description: 'Computes the MD5 hash of text (non-cryptographic; legacy use).',
  category: 'crypto',
  keywords: ['md5', 'hash', 'checksum', 'digest'],
  icon: Hash,
  load: () => import('./index'),
};
