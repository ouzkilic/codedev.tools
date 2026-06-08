import { Lock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'aes',
  title: 'AES Encrypt / Decrypt',
  description: 'AES-GCM encryption with a passphrase (Web Crypto).',
  category: 'crypto',
  keywords: ['aes', 'encrypt', 'decrypt', 'gcm', 'crypto', 'password'],
  icon: Lock,
  load: () => import('./index'),
};
