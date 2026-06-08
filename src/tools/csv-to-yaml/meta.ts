import { FileText } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-to-yaml',
  title: 'CSV → YAML',
  description: 'Converts CSV (with header) into a YAML list.',
  category: 'csv-excel',
  keywords: ['csv', 'yaml', 'convert'],
  icon: FileText,
  load: () => import('./index'),
};
