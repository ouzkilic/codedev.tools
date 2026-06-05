import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'unicode-escape',
  title: 'Unicode Escape',
  description: 'Escapes non-ASCII characters to \\uXXXX, or unescapes them.',
  category: 'encode',
  keywords: ['unicode', 'escape', 'unescape', '\\u', 'codepoint', 'utf'],
  icon: Type,
  load: () => import('./index'),
};
