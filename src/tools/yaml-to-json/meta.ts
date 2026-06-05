import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'yaml-to-json',
  title: 'YAML → JSON',
  description: 'Converts YAML into formatted JSON.',
  category: 'yaml',
  keywords: ['yaml', 'yml', 'json', 'convert', 'parse'],
  icon: FileText,
  load: () => import('./index'),
};
