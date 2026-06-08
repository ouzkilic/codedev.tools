import { Table2 } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'tsv-viewer',
  title: 'TSV → Table',
  description: 'Renders tab-separated values as an aligned table.',
  category: 'csv-excel',
  keywords: ['tsv', 'table', 'viewer', 'align', 'tab'],
  icon: Table2,
  load: () => import('./index'),
};
