import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'xml-to-json',
  title: 'XML → JSON',
  description: 'Converts XML into JSON (attributes prefixed with @_).',
  category: 'xml',
  keywords: ['xml', 'json', 'convert', 'parse', 'transform'],
  icon: Code2,
  load: () => import('./index'),
};
