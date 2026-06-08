import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'crc32',
  title: 'CRC32 Checksum',
  description: 'Computes the CRC32 checksum of text.',
  category: 'crypto',
  keywords: ['crc32', 'crc', 'checksum', 'hash'],
  icon: Hash,
  load: () => import('./index'),
};
