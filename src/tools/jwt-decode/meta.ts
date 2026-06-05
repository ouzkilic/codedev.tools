import { KeyRound } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'jwt-decode',
  title: 'JWT Decoder',
  description: 'Decodes a JWT header and payload (no signature verification).',
  category: 'encode',
  keywords: ['jwt', 'token', 'decode', 'jose', 'auth', 'bearer'],
  icon: KeyRound,
  load: () => import('./index'),
};
