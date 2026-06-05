import { Lock } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'hmac',
  title: 'HMAC Generator',
  description: 'Computes an HMAC signature from a message and a secret key.',
  category: 'crypto',
  keywords: ['hmac', 'sign', 'signature', 'mac', 'sha256', 'secret'],
  icon: Lock,
  load: () => import('./index'),
};
