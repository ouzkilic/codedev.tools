import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'xml-to-yaml',
  title: 'XML → YAML',
  description: 'Converts XML into YAML.',
  category: 'xml',
  keywords: ['xml', 'yaml', 'convert'],
  icon: Code2,
  load: () => import('./index'),
};
