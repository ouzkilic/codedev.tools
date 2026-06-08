import { Hash } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'charcode',
  title: 'Char Codes',
  description: 'Converts text to and from decimal character codes.',
  category: 'encode',
  keywords: ['charcode', 'char', 'code', 'ascii', 'unicode', 'codepoint'],
  icon: Hash,
  load: () => import('./index'),
};
