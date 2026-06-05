import { Binary } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base32',
  title: 'Base32 Encode / Decode',
  description: 'Encodes and decodes Base32 (RFC 4648).',
  category: 'encode',
  keywords: ['base32', 'encode', 'decode', 'rfc4648'],
  icon: Binary,
  load: () => import('./index'),
};
