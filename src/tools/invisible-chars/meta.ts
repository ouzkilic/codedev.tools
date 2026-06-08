import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'invisible-chars',
  title: 'Remove Invisible Characters',
  description: 'Strips zero-width and other invisible characters from text.',
  category: 'text',
  keywords: ['invisible', 'zero-width', 'zwsp', 'clean', 'unicode'],
  icon: Type,
  load: () => import('./index'),
};
