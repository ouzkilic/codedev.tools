import { KeySquare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'password',
  title: 'Password Generator',
  description: 'Generates strong random passwords (cryptographically secure).',
  category: 'generate',
  keywords: ['password', 'random', 'secure', 'generate', 'passphrase'],
  icon: KeySquare,
  load: () => import('./index'),
};
