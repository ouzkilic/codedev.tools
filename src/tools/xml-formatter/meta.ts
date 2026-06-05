import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'xml-formatter',
  title: 'XML Formatter',
  description: 'Pretty-prints XML with readable indentation.',
  category: 'xml',
  keywords: ['xml', 'format', 'beautify', 'pretty', 'indent'],
  icon: Code2,
  load: () => import('./index'),
};
