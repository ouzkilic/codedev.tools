import { Lock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'bcrypt',
  title: 'Bcrypt Hash / Verify',
  description: 'Hashes a password with bcrypt, or verifies one.',
  category: 'crypto',
  keywords: ['bcrypt', 'hash', 'password', 'verify', 'crypto'],
  icon: Lock,
  load: () => import('./index'),
};
