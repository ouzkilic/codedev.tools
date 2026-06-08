import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';
export const meta: ToolMeta = {
  id: 'yaml-formatter',
  title: 'YAML Formatter',
  description: 'Reformats and normalizes YAML with 2-space indent.',
  category: 'yaml',
  keywords: ['yaml', 'format', 'beautify', 'indent', 'pretty'],
  icon: FileText,
  load: () => import('./index'),
};
