import { KeySquare } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'token',
  title: 'Token Generator',
  description: 'Generates cryptographically-random tokens.',
  category: 'generate',
  keywords: ['token', 'secret', 'random', 'hex', 'base64', 'api key'],
  icon: KeySquare,
  load: () => import('./index'),
};
