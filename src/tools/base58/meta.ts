import { Binary } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base58',
  title: 'Base58 Encode / Decode',
  description: 'Encodes and decodes Base58 (Bitcoin alphabet).',
  category: 'encode',
  keywords: ['base58', 'encode', 'decode', 'bitcoin', 'btc'],
  icon: Binary,
  load: () => import('./index'),
};
