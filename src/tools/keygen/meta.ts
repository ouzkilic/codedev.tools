import { KeyRound } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'keygen',
  title: 'Key Pair Generator',
  description: 'Generates RSA or EC key pairs in PEM (Web Crypto).',
  category: 'crypto',
  keywords: ['key', 'keygen', 'rsa', 'ec', 'ecdsa', 'pem', 'keypair'],
  icon: KeyRound,
  load: () => import('./index'),
};
