import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'yaml-validate',
  title: 'YAML Validator',
  description: 'Checks whether YAML is syntactically valid.',
  category: 'yaml',
  keywords: ['yaml', 'yml', 'validate', 'lint', 'check'],
  icon: FileText,
  load: () => import('./index'),
};
