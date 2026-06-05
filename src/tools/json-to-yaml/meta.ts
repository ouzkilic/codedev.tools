import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-to-yaml',
  title: 'JSON → YAML',
  description: 'Converts JSON into YAML.',
  category: 'yaml',
  keywords: ['json', 'yaml', 'yml', 'convert', 'dump'],
  icon: FileText,
  load: () => import('./index'),
};
