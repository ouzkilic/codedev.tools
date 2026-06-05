import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'csv-to-markdown',
  title: 'CSV → Markdown Table',
  description: 'Converts CSV into a Markdown table.',
  category: 'csv-excel',
  keywords: ['csv', 'markdown', 'table', 'convert', 'md'],
  icon: Table2,
  load: () => import('./index'),
};
