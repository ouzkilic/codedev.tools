import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'xml-minify',
  title: 'XML Minify',
  description: 'Compresses XML by removing whitespace between tags.',
  category: 'xml',
  keywords: ['xml', 'minify', 'compress', 'compact', 'whitespace'],
  icon: Code2,
  load: () => import('./index'),
};
