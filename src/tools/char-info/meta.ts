import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'char-info',
  title: 'Character Info',
  description: 'Shows ASCII/Unicode details for a character or code point.',
  category: 'misc',
  keywords: ['ascii', 'unicode', 'character', 'code point', 'codepoint', 'charcode'],
  icon: Type,
  load: () => import('./index'),
};
