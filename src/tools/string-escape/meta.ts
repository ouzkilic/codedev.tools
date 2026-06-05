import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'string-escape',
  title: 'Backslash Escape',
  description: 'Escapes or unescapes \\n, \\t, \\r and backslashes in text.',
  category: 'text',
  keywords: ['escape', 'unescape', 'backslash', 'string', 'newline', 'tab'],
  icon: Type,
  load: () => import('./index'),
};
