import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'file-hash',
  title: 'File Hash',
  description: 'Computes the SHA hash (checksum) of a file.',
  category: 'crypto',
  keywords: ['file', 'hash', 'checksum', 'sha256', 'sha', 'integrity'],
  icon: Hash,
  load: () => import('./index'),
};
