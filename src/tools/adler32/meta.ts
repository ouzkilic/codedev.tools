import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'adler32', title: 'Adler-32 Checksum', description: 'Computes the Adler-32 checksum of text.', category: 'crypto',
  keywords: ['adler32', 'adler', 'checksum', 'hash'], icon: Hash, load: () => import('./index'),
};
