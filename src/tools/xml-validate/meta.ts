import { Code2 } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'xml-validate',
  title: 'XML Validator',
  description: 'Checks whether XML is well-formed.',
  category: 'xml',
  keywords: ['xml', 'validate', 'lint', 'well-formed', 'check'],
  icon: Code2,
  load: () => import('./index'),
};
