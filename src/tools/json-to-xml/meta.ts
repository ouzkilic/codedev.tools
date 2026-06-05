import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-xml',
  title: 'JSON → XML',
  description: 'Converts JSON into XML (@_ keys become attributes).',
  category: 'xml',
  keywords: ['json', 'xml', 'convert', 'build', 'transform'],
  icon: Code2,
  load: () => import('./index'),
};
