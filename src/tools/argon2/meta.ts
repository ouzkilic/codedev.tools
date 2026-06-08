import { Lock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'argon2',
  title: 'Argon2 Hash',
  description: 'Hashes a password with Argon2id (WASM).',
  category: 'crypto',
  keywords: ['argon2', 'hash', 'password', 'kdf', 'crypto'],
  icon: Lock,
  load: () => import('./index'),
};
