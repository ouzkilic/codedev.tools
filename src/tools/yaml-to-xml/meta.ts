import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'yaml-to-xml',
  title: 'YAML → XML',
  description: 'Converts YAML into XML.',
  category: 'xml',
  keywords: ['yaml', 'xml', 'convert'],
  icon: Code2,
  load: () => import('./index'),
};
