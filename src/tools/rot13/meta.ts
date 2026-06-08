import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'rot13', title: 'ROT13 / Caesar Cipher', description: 'Applies a Caesar shift (ROT13 by default) to letters.', category: 'text',
  keywords: ['rot13', 'caesar', 'cipher', 'shift', 'rotate'], icon: Type, load: () => import('./index'),
};
